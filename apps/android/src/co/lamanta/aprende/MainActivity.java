package co.lamanta.aprende;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.DialogInterface;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/** All pages and audio are APK assets. The manifest deliberately has no INTERNET permission. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String HOME = "https://" + HOST + "/";
    private static final int SAVE_REPORT = 42;
    private WebView web;
    private byte[] pendingReport;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(23,75,57));
        getWindow().setNavigationBarColor(Color.rgb(23,75,57));
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setDatabaseEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setMediaPlaybackRequiresUserGesture(false);
        web.addJavascriptInterface(new Reports(), "MantaAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isLocal(request.getUrl());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return asset(request);
            }
        });
        setContentView(web);
        web.loadUrl(HOME);
    }

    private boolean isLocal(Uri uri) { return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost()); }

    private WebResourceResponse reply(int status, String reason, String mime, Map<String,String> headers, byte[] body) {
        return new WebResourceResponse(mime, mime.startsWith("text/") || mime.contains("json") || mime.contains("javascript") ? "UTF-8" : null,
            status, reason, headers, new ByteArrayInputStream(body));
    }

    private WebResourceResponse asset(WebResourceRequest request) {
        Map<String,String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-store");
        headers.put("X-Content-Type-Options", "nosniff");
        if (!isLocal(request.getUrl()) || !"GET".equals(request.getMethod()))
            return reply(403,"Forbidden","text/plain",headers,new byte[0]);
        String path = request.getUrl().getPath();
        if (path == null || path.equals("/")) path = "/index.html";
        if (path.contains("..") || path.contains("\\") || path.indexOf('\0') >= 0)
            return reply(403,"Forbidden","text/plain",headers,new byte[0]);
        String mime = path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" :
            path.endsWith(".html") ? "text/html" : path.endsWith(".json") || path.endsWith(".webmanifest") ? "application/json" :
            path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".png") ? "image/png" : path.endsWith(".mp3") ? "audio/mpeg" : "application/octet-stream";
        try (InputStream input = getAssets().open("www" + path); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[16384]; int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer,0,count);
            byte[] data = output.toByteArray();
            String range = null;
            for (Map.Entry<String,String> header : request.getRequestHeaders().entrySet())
                if (header.getKey().equalsIgnoreCase("Range")) range = header.getValue();
            headers.put("Accept-Ranges", "bytes");
            if (range != null) {
                if (!range.matches("bytes=\\d*-\\d*")) throw new IllegalArgumentException();
                String[] bounds = range.substring(6).split("-",-1);
                int start = bounds[0].isEmpty() ? Math.max(0,data.length-Integer.parseInt(bounds[1])) : Integer.parseInt(bounds[0]);
                int end = bounds[0].isEmpty() || bounds[1].isEmpty() ? data.length-1 : Math.min(data.length-1,Integer.parseInt(bounds[1]));
                if (start > end || start >= data.length) {
                    headers.put("Content-Range","bytes */"+data.length);
                    return reply(416,"Range Not Satisfiable",mime,headers,new byte[0]);
                }
                headers.put("Content-Range","bytes "+start+"-"+end+"/"+data.length);
                headers.put("Content-Length",String.valueOf(end-start+1));
                return reply(206,"Partial Content",mime,headers,java.util.Arrays.copyOfRange(data,start,end+1));
            }
            headers.put("Content-Length",String.valueOf(data.length));
            return reply(200,"OK",mime,headers,data);
        } catch (Exception error) {
            return reply(404,"Not Found","text/plain",headers,"Recurso local no encontrado".getBytes(StandardCharsets.UTF_8));
        }
    }

    public final class Reports {
        @JavascriptInterface public void saveReport(String filename, String body, String mime) {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (pendingReport != null) return;
                pendingReport = body.getBytes(StandardCharsets.UTF_8);
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType(mime.startsWith("text/csv") ? "text/csv" : "application/json");
                intent.putExtra(Intent.EXTRA_TITLE,filename.replaceAll("[^a-zA-Z0-9._-]","_"));
                try { startActivityForResult(intent,SAVE_REPORT); }
                catch (Exception error) { pendingReport=null; Toast.makeText(MainActivity.this,"No se pudo abrir el selector de archivos.",Toast.LENGTH_LONG).show(); }
            }});
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if (request != SAVE_REPORT) return;
        byte[] report = pendingReport; pendingReport=null;
        if (result != RESULT_OK || data == null || data.getData() == null || report == null) return;
        try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
            if (out == null) throw new IllegalStateException();
            out.write(report);
            Toast.makeText(this,"Reporte guardado.",Toast.LENGTH_SHORT).show();
        } catch (Exception error) { Toast.makeText(this,"No se pudo guardar el reporte. Intenta exportarlo otra vez.",Toast.LENGTH_LONG).show(); }
    }

    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setTitle("¿Salir de La Manta Aprende?")
            .setMessage("Los pasos confirmados quedan guardados en este celular.")
            .setNegativeButton("Seguir aprendiendo",null).setPositiveButton("Salir", new DialogInterface.OnClickListener() { @Override public void onClick(DialogInterface dialog, int which) { finish(); } }).show();
    }
    @Override protected void onDestroy() { if (web != null) { web.removeJavascriptInterface("MantaAndroid");web.destroy(); } super.onDestroy(); }
}
