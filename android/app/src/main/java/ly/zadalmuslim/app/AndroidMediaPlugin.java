package ly.zadalmuslim.app;

import android.content.ClipData;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Base64;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "AndroidMedia")
public class AndroidMediaPlugin extends Plugin {
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final Map<String, ExportSession> exports = new ConcurrentHashMap<>();

    private static final class ExportSession {
        final Uri uri;
        final File file;
        final OutputStream stream;
        final String fileName;
        final String mimeType;
        final boolean mediaStore;
        final boolean share;
        long size = 0;

        ExportSession(Uri uri, File file, OutputStream stream, String fileName,
                      String mimeType, boolean mediaStore, boolean share) {
            this.uri = uri;
            this.file = file;
            this.stream = stream;
            this.fileName = fileName;
            this.mimeType = mimeType;
            this.mediaStore = mediaStore;
            this.share = share;
        }
    }

    @PluginMethod
    public void beginVideoSave(PluginCall call) {
        beginExport(call, false);
    }

    @PluginMethod
    public void beginVideoShare(PluginCall call) {
        beginExport(call, true);
    }

    private void beginExport(PluginCall call, boolean share) {
        String fileName = safeFileName(call.getString("fileName", "zad-video.mp4"));
        String mimeType = safeMimeType(call.getString("mimeType", "video/mp4"));
        if (!mimeType.startsWith("video/")) {
            call.reject("نوع الملف ليس فيديو.");
            return;
        }
        String id = UUID.randomUUID().toString();
        io.execute(() -> {
            Uri uri = null;
            File file = null;
            try {
                OutputStream output;
                boolean mediaStore = !share && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q;
                if (share) {
                    File directory = new File(getContext().getCacheDir(), "shared");
                    if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("تعذر إنشاء مجلد المشاركة المؤقت.");
                    file = new File(directory, UUID.randomUUID().toString() + "-" + fileName);
                    output = new FileOutputStream(file, false);
                } else if (mediaStore) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Video.Media.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Video.Media.MIME_TYPE, mimeType);
                    values.put(MediaStore.Video.Media.RELATIVE_PATH,
                            Environment.DIRECTORY_MOVIES + "/ZadAlMuslim");
                    values.put(MediaStore.Video.Media.IS_PENDING, 1);
                    uri = getContext().getContentResolver().insert(
                            MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) throw new IllegalStateException("تعذر إنشاء ملف في Movies/ZadAlMuslim.");
                    output = getContext().getContentResolver().openOutputStream(uri, "w");
                    if (output == null) throw new IllegalStateException("تعذر فتح ملف الفيديو للكتابة.");
                } else {
                    File parent = getContext().getExternalFilesDir(Environment.DIRECTORY_MOVIES);
                    if (parent == null) parent = new File(getContext().getFilesDir(), "Movies");
                    File directory = new File(parent, "ZadAlMuslim");
                    if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("تعذر إنشاء مجلد الفيديو.");
                    file = new File(directory, UUID.randomUUID().toString() + "-" + fileName);
                    output = new FileOutputStream(file, false);
                }
                exports.put(id, new ExportSession(uri, file, output, fileName, mimeType, mediaStore, share));
                JSObject result = new JSObject();
                result.put("sessionId", id);
                result.put("fileName", fileName);
                call.resolve(result);
            } catch (Exception error) {
                if (uri != null) getContext().getContentResolver().delete(uri, null, null);
                if (file != null) file.delete();
                call.reject("تعذر تجهيز ملف الفيديو: " + error.getMessage(), error);
            }
        });
    }

    @PluginMethod
    public void appendVideoChunk(PluginCall call) {
        String id = call.getString("sessionId");
        String encoded = call.getString("base64");
        ExportSession session = exports.get(id);
        if (session == null || encoded == null) {
            call.reject("جلسة حفظ الفيديو غير صالحة.");
            return;
        }
        io.execute(() -> {
            try {
                byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
                session.stream.write(bytes);
                session.size += bytes.length;
                call.resolve();
            } catch (Exception error) {
                call.reject("تعذرت كتابة جزء من الفيديو: " + error.getMessage(), error);
            }
        });
    }

    @PluginMethod
    public void finishVideoSave(PluginCall call) {
        finishExport(call, false);
    }

    @PluginMethod
    public void finishVideoShare(PluginCall call) {
        finishExport(call, true);
    }

    private void finishExport(PluginCall call, boolean share) {
        String id = call.getString("sessionId");
        ExportSession session = exports.get(id);
        if (session == null || session.share != share) {
            call.reject("جلسة حفظ الفيديو غير موجودة.");
            return;
        }
        io.execute(() -> {
            try {
                session.stream.flush();
                session.stream.close();
                if (session.size <= 0) throw new IllegalStateException("ملف الفيديو فارغ.");
                Uri uri = session.uri;
                if (session.mediaStore) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Video.Media.IS_PENDING, 0);
                    getContext().getContentResolver().update(session.uri, values, null, null);
                } else {
                    File target = session.file;
                    if (target == null || !target.isFile() || target.length() <= 0) {
                        throw new IllegalStateException("لم يتم إنشاء ملف فيديو صالح.");
                    }
                    uri = FileProvider.getUriForFile(getContext(),
                            getContext().getPackageName() + ".fileprovider", target);
                }
                exports.remove(id);
                if (share) {
                    Uri sharedUri = uri;
                    getActivity().runOnUiThread(() -> launchVideoShare(call, session, sharedUri));
                } else {
                    JSObject result = new JSObject();
                    result.put("uri", uri.toString());
                    result.put("fileName", session.fileName);
                    result.put("bytes", session.size);
                    result.put("mimeType", session.mimeType);
                    call.resolve(result);
                }
            } catch (Exception error) {
                cleanup(id, session);
                call.reject("تعذر إنهاء ملف الفيديو: " + error.getMessage(), error);
            }
        });
    }

    private void launchVideoShare(PluginCall call, ExportSession session, Uri uri) {
        try {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType(session.mimeType);
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.setClipData(ClipData.newUri(getContext().getContentResolver(), session.fileName, uri));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, "مشاركة الفيديو");
            getActivity().startActivity(chooser);
            JSObject result = new JSObject();
            result.put("shared", true);
            result.put("fileName", session.fileName);
            result.put("bytes", session.size);
            result.put("mimeType", session.mimeType);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("تعذر فتح قائمة مشاركة الفيديو: " + error.getMessage(), error);
        }
    }

    @PluginMethod
    public void cancelVideoExport(PluginCall call) {
        String id = call.getString("sessionId");
        ExportSession session = exports.get(id);
        if (session != null) cleanup(id, session);
        call.resolve();
    }

    private void cleanup(String id, ExportSession session) {
        exports.remove(id);
        try { session.stream.close(); } catch (Exception ignored) {}
        if (session.uri != null && session.mediaStore) {
            getContext().getContentResolver().delete(session.uri, null, null);
        }
        if (session.file != null) session.file.delete();
    }

    @PluginMethod
    public void checkLocationServices(PluginCall call) {
        try {
            LocationManager manager = (LocationManager) getContext().getSystemService(android.content.Context.LOCATION_SERVICE);
            boolean enabled;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                enabled = manager != null && manager.isLocationEnabled();
            } else {
                enabled = manager != null && (manager.isProviderEnabled(LocationManager.GPS_PROVIDER)
                        || manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER));
            }
            JSObject result = new JSObject();
            result.put("enabled", enabled);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("تعذر التحقق من خدمة الموقع.", error);
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("تعذر فتح إعدادات التطبيق.", error);
        }
    }

    private String safeFileName(String input) {
        String name = input == null ? "zad-video.mp4" : input.replace('/', '_').replace('\\', '_').replaceAll("\\p{Cntrl}", "_");
        name = name.replaceAll("[^\\p{L}\\p{N}._-]", "_");
        if (name.isEmpty() || name.equals(".") || name.equals("..")) name = "zad-video.mp4";
        return name.length() > 120 ? name.substring(name.length() - 120) : name;
    }

    private String safeMimeType(String input) {
        if ("video/webm".equalsIgnoreCase(input)) return "video/webm";
        return "video/mp4";
    }
}
