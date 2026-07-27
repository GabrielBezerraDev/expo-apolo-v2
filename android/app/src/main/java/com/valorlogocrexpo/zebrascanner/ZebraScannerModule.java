package com.valorlogocrexpo.zebrascanner;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ZebraScannerModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "ZebraScanner";
    private static final String EVENT_NAME = "onBarcodeScanned";

    /*
     * This value must be exactly the same as the Intent Action
     * configured in the DataWedge profile.
     */
    private static final String DATAWEDGE_ACTION =
            "com.valorlogocrexpo.SCAN";

    private static final String EXTRA_DATA =
            "com.symbol.datawedge.data_string";

    private static final String EXTRA_LABEL_TYPE =
            "com.symbol.datawedge.label_type";

    private static final String EXTRA_SOURCE =
            "com.symbol.datawedge.source";

    private final ReactApplicationContext reactContext;

    private boolean receiverRegistered = false;
    private int listenerCount = 0;

    public ZebraScannerModule(
            ReactApplicationContext reactContext
    ) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    private final BroadcastReceiver scannerReceiver =
            new BroadcastReceiver() {
                @Override
                public void onReceive(
                        Context context,
                        Intent intent
                ) {
                    if (!DATAWEDGE_ACTION.equals(intent.getAction())) {
                        return;
                    }

                    String data = intent.getStringExtra(EXTRA_DATA);
                    String labelType =
                            intent.getStringExtra(EXTRA_LABEL_TYPE);
                    String source =
                            intent.getStringExtra(EXTRA_SOURCE);

                    if (data == null) {
                        return;
                    }

                    sendScanEvent(data, labelType, source);
                }
            };

    private void sendScanEvent(
            String data,
            String labelType,
            String source
    ) {
        WritableMap payload = Arguments.createMap();

        payload.putString("data", data);

        if (labelType != null) {
            payload.putString("labelType", labelType);
        } else {
            payload.putNull("labelType");
        }

        if (source != null) {
            payload.putString("source", source);
        } else {
            payload.putNull("source");
        }

        reactContext
                .getJSModule(
                        DeviceEventManagerModule
                                .RCTDeviceEventEmitter.class
                )
                .emit(EVENT_NAME, payload);
    }

    private void registerScannerReceiver() {
        if (receiverRegistered) {
            return;
        }

        IntentFilter intentFilter =
                new IntentFilter(DATAWEDGE_ACTION);

        /*
         * DataWedge is another Android application, so the receiver
         * needs to accept broadcasts originating outside this app.
         */
        ContextCompat.registerReceiver(
                reactContext,
                scannerReceiver,
                intentFilter,
                ContextCompat.RECEIVER_EXPORTED
        );

        receiverRegistered = true;
    }

    private void unregisterScannerReceiver() {
        if (!receiverRegistered) {
            return;
        }

        try {
            reactContext.unregisterReceiver(scannerReceiver);
        } catch (IllegalArgumentException ignored) {
            // The receiver was already unregistered.
        }

        receiverRegistered = false;
    }

    /*
     * NativeEventEmitter expects these two native methods.
     */

    @ReactMethod
    public void addListener(String eventName) {
        listenerCount++;

        if (
                EVENT_NAME.equals(eventName)
                        && listenerCount == 1
        ) {
            registerScannerReceiver();
        }
    }

    @ReactMethod
    public void removeListeners(double count) {
        listenerCount = Math.max(
                0,
                listenerCount - (int) count
        );

        if (listenerCount == 0) {
            unregisterScannerReceiver();
        }
    }

    @Override
    public void invalidate() {
        unregisterScannerReceiver();
        super.invalidate();
    }
}