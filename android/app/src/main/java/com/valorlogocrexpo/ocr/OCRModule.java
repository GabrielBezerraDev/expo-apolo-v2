package com.valorlogocrexpo.ocr;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Rect;

import androidx.exifinterface.media.ExifInterface;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class OCRModule extends ReactContextBaseJavaModule {
  private static final String MODULE_NAME = "OCRModule";
  private static final int EDGE_TOUCH_THRESHOLD_PX = 8;
  private static final int MIN_LINE_LENGTH = 2;
  private static final float MIN_ALNUM_RATIO = 0.4f;
  private static final float MIN_HEIGHT_RATIO = 0.55f;

  private static final Map<String, Pattern> LABEL_FIELDS = new LinkedHashMap<>();

  static {
    LABEL_FIELDS.put("poNumber", Pattern.compile("\\(?K\\)?\\s*PO\\s*N[:\\s]*([A-Z0-9_\\-]{4,})", Pattern.CASE_INSENSITIVE));
    LABEL_FIELDS.put("salcompCode", Pattern.compile("SALCOMP\\s*CODE[:\\s]*([A-Z0-9_\\-]{4,})", Pattern.CASE_INSENSITIVE));
    LABEL_FIELDS.put("custProdId", Pattern.compile("\\(?P\\)?\\s*CUST\\.?\\s*PROD\\.?\\s*ID[:\\s]*([A-Z0-9_\\-]{4,})", Pattern.CASE_INSENSITIVE));
    LABEL_FIELDS.put("quantity", Pattern.compile("\\(?Q\\)?\\s*QUANT[:\\s]*([0-9]{1,8})", Pattern.CASE_INSENSITIVE));
    LABEL_FIELDS.put("batch", Pattern.compile("\\(?B\\)?\\s*BATCH[:\\s]*([A-Z0-9]{6,})", Pattern.CASE_INSENSITIVE));
    LABEL_FIELDS.put("netWeightKg", Pattern.compile("([0-9]+[.,][0-9]+)\\s*KG", Pattern.CASE_INSENSITIVE));
    LABEL_FIELDS.put("date", Pattern.compile("\\b([0-3]?[0-9][/\\-][0-1]?[0-9][/\\-][0-9]{2,4})\\b"));
  }

  private final ReactApplicationContext reactContext;
  private final TextRecognizer textRecognizer;

  public OCRModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void setScreenOrientation(String orientation, Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Current activity is not available");
      return;
    }

    int requestedOrientation = "portrait".equals(orientation)
      ? ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
      : ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;

    activity.runOnUiThread(() -> {
      activity.setRequestedOrientation(requestedOrientation);
      promise.resolve(true);
    });
  }

  @ReactMethod
  public void recognizeText(String imagePath, ReadableMap options, Promise promise) {
    try {
      String cleanPath = cleanPath(imagePath);
      boolean multipleAttempts = options == null || !options.hasKey("multipleAttempts") || options.getBoolean("multipleAttempts");
      boolean strictFiltering = options != null && options.hasKey("strictFiltering") && options.getBoolean("strictFiltering");

      Bitmap original = BitmapFactory.decodeFile(cleanPath);
      if (original == null) {
        promise.reject("INVALID_IMAGE", "Could not load image: " + cleanPath);
        return;
      }

      original = ensureMinResolution(applyExifRotation(original, cleanPath), 1200);

      List<Attempt> attempts = new ArrayList<>();
      int[] rotations = multipleAttempts ? new int[] {0, 90, 270, 180} : new int[] {0};

      for (int rotation : rotations) {
        Bitmap rotated = rotation == 0 ? original : rotate(original, rotation);
        attempts.add(runOCR(rotated, String.format(Locale.US, "rot%d_raw", rotation), strictFiltering));

        if (multipleAttempts) {
          Bitmap enhanced = enhanceContrast(toGrayscale(rotated));
          attempts.add(runOCR(enhanced, String.format(Locale.US, "rot%d_enhanced", rotation), strictFiltering));
          if (enhanced != rotated) enhanced.recycle();
        }

        if (rotated != original) rotated.recycle();
      }

      Attempt best = pickBest(attempts);
      if (best == null || best.text.trim().isEmpty()) {
        promise.reject("NO_TEXT_FOUND", "No text found in image");
        return;
      }

      WritableMap result = Arguments.createMap();
      result.putBoolean("success", true);
      result.putString("text", best.text);
      result.putString("rawText", best.rawText);
      result.putString("bestVariant", best.label);
      result.putInt("filteredLines", best.filteredCount);
      result.putInt("matchedFields", best.fieldMatches);
      result.putMap("fields", best.extracted);
      result.putArray("blocks", best.blocks);
      promise.resolve(result);
    } catch (Exception error) {
      promise.reject("OCR_ERROR", error.getMessage(), error);
    }
  }

  @ReactMethod
  public void cropImage(String imagePath, int x, int y, int width, int height, Promise promise) {
    try {
      String cleanPath = cleanPath(imagePath);
      Bitmap original = BitmapFactory.decodeFile(cleanPath);
      if (original == null) {
        promise.reject("INVALID_IMAGE", "Could not load image: " + cleanPath);
        return;
      }

      original = applyExifRotation(original, cleanPath);
      int safeX = clamp(x, 0, original.getWidth() - 1);
      int safeY = clamp(y, 0, original.getHeight() - 1);
      int safeWidth = Math.min(width, original.getWidth() - safeX);
      int safeHeight = Math.min(height, original.getHeight() - safeY);

      if (safeWidth <= 0 || safeHeight <= 0) {
        promise.reject("INVALID_CROP", "Crop rectangle outside image bounds");
        return;
      }

      Bitmap cropped = Bitmap.createBitmap(original, safeX, safeY, safeWidth, safeHeight);
      File output = new File(reactContext.getCacheDir(), "ocr_crop_" + System.currentTimeMillis() + ".jpg");

      try (FileOutputStream stream = new FileOutputStream(output)) {
        cropped.compress(Bitmap.CompressFormat.JPEG, 95, stream);
      }

      WritableMap result = Arguments.createMap();
      result.putString("path", "file://" + output.getAbsolutePath());
      result.putInt("width", safeWidth);
      result.putInt("height", safeHeight);
      promise.resolve(result);
    } catch (Exception error) {
      promise.reject("CROP_ERROR", error.getMessage(), error);
    }
  }

  private Attempt runOCR(Bitmap bitmap, String label, boolean strictFiltering) throws Exception {
    InputImage image = InputImage.fromBitmap(bitmap, 0);
    Text visionText = Tasks.await(textRecognizer.process(image));
    FilterResult filtered = filterQualityLines(visionText, bitmap.getWidth(), bitmap.getHeight(), strictFiltering);

    Attempt attempt = new Attempt();
    attempt.label = label;
    attempt.rawText = visionText.getText();
    attempt.text = filtered.cleanText;
    attempt.filteredCount = filtered.droppedCount;
    attempt.extracted = extractFields(filtered.cleanText);
    attempt.fieldMatches = countMatches(attempt.extracted);
    attempt.blocks = blocksToArray(visionText);
    attempt.score = scoreAttempt(attempt.text, attempt.fieldMatches);
    return attempt;
  }

  private FilterResult filterQualityLines(Text visionText, int imageWidth, int imageHeight, boolean strict) {
    FilterResult result = new FilterResult();
    List<Integer> heights = new ArrayList<>();

    for (Text.TextBlock block : visionText.getTextBlocks()) {
      for (Text.Line line : block.getLines()) {
        Rect bounds = line.getBoundingBox();
        if (bounds != null) heights.add(bounds.height());
      }
    }

    int minHeight = 0;
    if (!heights.isEmpty()) {
      heights.sort(Integer::compareTo);
      minHeight = Math.round(heights.get(heights.size() / 2) * MIN_HEIGHT_RATIO);
    }

    StringBuilder builder = new StringBuilder();
    for (Text.TextBlock block : visionText.getTextBlocks()) {
      for (Text.Line line : block.getLines()) {
        if (shouldDropLine(line.getText(), line.getBoundingBox(), imageWidth, imageHeight, minHeight, strict)) {
          result.droppedCount++;
          continue;
        }

        if (builder.length() > 0) builder.append('\n');
        builder.append(line.getText());
        result.keptCount++;
      }
    }

    result.cleanText = builder.toString();
    return result;
  }

  private boolean shouldDropLine(String text, Rect bounds, int imageWidth, int imageHeight, int minHeight, boolean strict) {
    if (text == null || text.trim().length() < MIN_LINE_LENGTH) return true;

    int alnum = 0;
    int total = 0;
    for (char character : text.toCharArray()) {
      if (!Character.isWhitespace(character)) {
        total++;
        if (Character.isLetterOrDigit(character)) alnum++;
      }
    }

    if (total > 0 && (float) alnum / total < MIN_ALNUM_RATIO) return true;
    if (bounds == null) return false;
    if (bounds.top <= EDGE_TOUCH_THRESHOLD_PX) return true;
    if (bounds.bottom >= imageHeight - EDGE_TOUCH_THRESHOLD_PX) return true;
    if (strict && bounds.left <= EDGE_TOUCH_THRESHOLD_PX) return true;
    if (strict && bounds.right >= imageWidth - EDGE_TOUCH_THRESHOLD_PX) return true;
    return minHeight > 0 && bounds.height() < minHeight;
  }

  private WritableMap extractFields(String text) {
    WritableMap result = Arguments.createMap();
    if (text == null) return result;

    String normalized = text.replace('\n', ' ').replaceAll("\\s+", " ");
    for (Map.Entry<String, Pattern> entry : LABEL_FIELDS.entrySet()) {
      Matcher matcher = entry.getValue().matcher(normalized);
      if (matcher.find()) result.putString(entry.getKey(), matcher.group(1).trim());
    }
    return result;
  }

  private int countMatches(WritableMap fields) {
    int matches = 0;
    for (String key : LABEL_FIELDS.keySet()) {
      if (fields.hasKey(key) && !fields.isNull(key)) matches++;
    }
    return matches;
  }

  private int scoreAttempt(String text, int fieldMatches) {
    if (text == null) return 0;
    return fieldMatches * 100 + Math.min(text.length(), 500) / 10;
  }

  private Attempt pickBest(List<Attempt> attempts) {
    Attempt best = null;
    for (Attempt attempt : attempts) {
      if (attempt == null) continue;
      if (best == null || attempt.score > best.score) best = attempt;
    }
    return best;
  }

  private WritableArray blocksToArray(Text visionText) {
    WritableArray blocks = Arguments.createArray();
    for (Text.TextBlock block : visionText.getTextBlocks()) {
      WritableMap blockMap = Arguments.createMap();
      blockMap.putString("text", block.getText());
      Rect bounds = block.getBoundingBox();
      if (bounds != null) blockMap.putMap("bounds", rectToMap(bounds));
      blocks.pushMap(blockMap);
    }
    return blocks;
  }

  private WritableMap rectToMap(Rect rect) {
    WritableMap map = Arguments.createMap();
    map.putInt("left", rect.left);
    map.putInt("top", rect.top);
    map.putInt("right", rect.right);
    map.putInt("bottom", rect.bottom);
    map.putInt("width", rect.width());
    map.putInt("height", rect.height());
    return map;
  }

  private Bitmap applyExifRotation(Bitmap bitmap, String path) {
    try {
      ExifInterface exif = new ExifInterface(path);
      int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
      Matrix matrix = new Matrix();

      switch (orientation) {
        case ExifInterface.ORIENTATION_ROTATE_90:
          matrix.postRotate(90);
          break;
        case ExifInterface.ORIENTATION_ROTATE_180:
          matrix.postRotate(180);
          break;
        case ExifInterface.ORIENTATION_ROTATE_270:
          matrix.postRotate(270);
          break;
        default:
          return bitmap;
      }

      return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
    } catch (IOException error) {
      return bitmap;
    }
  }

  private Bitmap ensureMinResolution(Bitmap source, int minShortSide) {
    int shortSide = Math.min(source.getWidth(), source.getHeight());
    if (shortSide >= minShortSide) return source;

    float scale = (float) minShortSide / shortSide;
    int width = Math.round(source.getWidth() * scale);
    int height = Math.round(source.getHeight() * scale);
    return Bitmap.createScaledBitmap(source, width, height, true);
  }

  private Bitmap rotate(Bitmap source, int degrees) {
    Matrix matrix = new Matrix();
    matrix.postRotate(degrees);
    return Bitmap.createBitmap(source, 0, 0, source.getWidth(), source.getHeight(), matrix, true);
  }

  private Bitmap toGrayscale(Bitmap source) {
    ColorMatrix matrix = new ColorMatrix();
    matrix.setSaturation(0);
    return applyColorMatrix(source, matrix);
  }

  private Bitmap enhanceContrast(Bitmap source) {
    ColorMatrix matrix = new ColorMatrix(new float[] {
      1.6f, 0, 0, 0, -45,
      0, 1.6f, 0, 0, -45,
      0, 0, 1.6f, 0, -45,
      0, 0, 0, 1, 0
    });
    return applyColorMatrix(source, matrix);
  }

  private Bitmap applyColorMatrix(Bitmap source, ColorMatrix matrix) {
    Bitmap output = Bitmap.createBitmap(source.getWidth(), source.getHeight(), source.getConfig() != null ? source.getConfig() : Bitmap.Config.ARGB_8888);
    Canvas canvas = new Canvas(output);
    Paint paint = new Paint();
    paint.setColorFilter(new ColorMatrixColorFilter(matrix));
    canvas.drawBitmap(source, 0, 0, paint);
    return output;
  }

  private String cleanPath(String imagePath) {
    return imagePath == null ? "" : imagePath.replace("file://", "");
  }

  private int clamp(int value, int min, int max) {
    return Math.max(min, Math.min(value, max));
  }

  @Override
  public void invalidate() {
    super.invalidate();
    textRecognizer.close();
  }

  private static class Attempt {
    String label = "";
    String text = "";
    String rawText = "";
    int filteredCount = 0;
    int score = 0;
    int fieldMatches = 0;
    WritableMap extracted = Arguments.createMap();
    WritableArray blocks = Arguments.createArray();
  }

  private static class FilterResult {
    String cleanText = "";
    int keptCount = 0;
    int droppedCount = 0;
  }
}
