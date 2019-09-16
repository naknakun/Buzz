package com.ubcare.buzz;

import android.Manifest;
import android.content.ContentValues;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.TextUtils;
import android.text.method.ScrollingMovementMethod;
import android.util.Base64;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.google.gson.Gson;
import com.kakao.sdk.newtoneapi.SpeechRecognizeListener;
import com.kakao.sdk.newtoneapi.SpeechRecognizerClient;
import com.kakao.sdk.newtoneapi.SpeechRecognizerManager;
import com.kakao.sdk.newtoneapi.TextToSpeechClient;
import com.kakao.sdk.newtoneapi.TextToSpeechListener;
import com.kakao.sdk.newtoneapi.TextToSpeechManager;
import com.ubcare.buzz.Model.Buzz.ResponseModelBuzz;
import com.ubcare.buzz.Model.Buzz.SendModelBuzz;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;

import ai.api.android.GsonFactory;

import static com.kakao.sdk.newtoneapi.SpeechRecognizerActivity.EXTRA_KEY_API_KEY;
import static com.kakao.util.helper.Utility.getPackageInfo;

public class MainActivity extends AppCompatActivity implements View.OnClickListener, SpeechRecognizeListener, TextToSpeechListener {
    private Context mContext;
    private static final int REQUEST_CODE_AUDIO_AND_WRITE_EXTERNAL_STORAGE = 0;
    private TextToSpeechClient ttsClient;
    private Gson gson = GsonFactory.getGson();
    private boolean actionIncomplete = false;

    InputMethodManager inputMethodManager;
    TextView tv_mic_result;
    TextView tv_speak_result;
    EditText testText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 권한획득
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED || ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.RECORD_AUDIO) && ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
                ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.RECORD_AUDIO, Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQUEST_CODE_AUDIO_AND_WRITE_EXTERNAL_STORAGE);
            } else {
                // 유저가 거부하면서 다시 묻지 않기를 클릭.. 권한이 없다고 유저에게 직접 알림.
            }
        }

        // HashKey 가져오기
        mContext = getApplicationContext();
        String key = getKeyHash(mContext);
        Log.d("Key", "HashKey:" + key);

        // Kakao 초기화
        SpeechRecognizerManager.getInstance().initializeLibrary(this);
        TextToSpeechManager.getInstance().initializeLibrary(getApplicationContext());
        ttsClient = new TextToSpeechClient.Builder()
                .setSpeechMode(TextToSpeechClient.NEWTONE_TALK_2) // 음성합성방식
                .setSpeechSpeed(1.0) // 발음 속도(0.5~4.0)
                .setSpeechVoice(TextToSpeechClient.VOICE_WOMAN_DIALOG_BRIGHT) //TTS 음색 모드 설정
                .setListener(this)
                .build();

        // Buzz test API 초기화
        String url = "https://codecaffeine.azurewebsites.net/test/dialogFlowStart";
        ContentValues values = new ContentValues();
        values.put(null, "{\"MEMBERID\":\"adam\"}");
        NetworkTask networkTask = new NetworkTask(url, values);
        networkTask.execute();

        // 컨트롤 초기화
        findViewById(R.id.iv_ubcarelogo).setOnClickListener(this);
        findViewById(R.id.iv_mic).setOnClickListener(this);
        findViewById(R.id.iv_speak).setOnClickListener(this);
        tv_mic_result = findViewById(R.id.tv_mic_result);
        tv_mic_result.setMovementMethod(ScrollingMovementMethod.getInstance());
        tv_speak_result = findViewById(R.id.tv_speak_result);
        tv_speak_result.setMovementMethod(ScrollingMovementMethod.getInstance());
        testText = findViewById(R.id.et_test);
        testText.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                //Enter key Action
                if ((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                    //RequestDialogFlow(testText.getText().toString());
                    RequestBuzz(testText.getText().toString());
                    inputMethodManager.hideSoftInputFromWindow(testText.getWindowToken(), 0);
                    return true;
                }
                return false;
            }
        });
        inputMethodManager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
    }

    @Override
    public void onClick(View view) {
        int id = view.getId();
        String serviceType = SpeechRecognizerClient.SERVICE_TYPE_WEB;
        Log.i("MainActivity", "ServiceType : " + serviceType);

        // 키보드 내리기
        inputMethodManager.hideSoftInputFromWindow(testText.getWindowToken(), 0);

        if (id == R.id.iv_mic){
            SpeechToText();
        }
        else if (id == R.id.iv_speak){
            TextToSpeech(tv_speak_result.getText().toString());
        }
        //Logo - Test 버튼
        else if (id == R.id.iv_ubcarelogo){
            TextToSpeech("안녕하세요! 버즈에요!");
        }
        else {
            finish();
        }
    }

    private void SpeechToText() {
        Intent i = new Intent(getApplicationContext(), VoiceRecoActivity.class);
        i.putExtra(EXTRA_KEY_API_KEY, "14d27d591c3ebbe09dcecb9a05c17e6e");
        startActivityForResult(i, 0);
    }

    private void TextToSpeech(String text) {
        if(TextUtils.isEmpty(text)) return;
        if (ttsClient != null && ttsClient.isPlaying()) {
            ttsClient.stop();
            return;
        }
        tv_speak_result.setText(text);
        ttsClient.play(text);
    }

    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == RESULT_OK) { // 성공
            ArrayList<String> results = data.getStringArrayListExtra(VoiceRecoActivity.EXTRA_KEY_RESULT_ARRAY);
            tv_mic_result.setText(results.get(0));
            //RequestDialogFlow(results.get(0));
            RequestBuzz(results.get(0));
        }
        else if (requestCode == RESULT_CANCELED) { // 실패
            String errorMsg = data.getStringExtra(VoiceRecoActivity.EXTRA_KEY_ERROR_MESSAGE);
            MessageBox(errorMsg);
        }
    }

    private void RequestBuzz(String speech) {
        SendModelBuzz sendModelForBuzz = new SendModelBuzz();
        sendModelForBuzz.setMEMBERID("adam"); // 회원가입을 했다고 가정하고 진행한다. 사용자ID: adam
        sendModelForBuzz.setTEXT(speech);

        String url = "https://codecaffeine.azurewebsites.net/test/dialogFlow";

        ContentValues values = new ContentValues();
        values.put(null, gson.toJson(sendModelForBuzz));
        NetworkTask networkTask = new NetworkTask(url, values);
        networkTask.execute();
    }

     public class NetworkTask extends AsyncTask<Void, Void, String> {
        private String url;
        private ContentValues value;

        public NetworkTask(String url, ContentValues value) {
            this.url = url;
            this.value = value;
        }

        @Override
        protected String doInBackground(Void... voids) {
            String result; // 요청 결과를 저장할 변수.
            RequestHttpConnection requestHttpURLConnection = new RequestHttpConnection();
            result = requestHttpURLConnection.Request(url, value);
            return result;
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            ResponseModelBuzz responseModelBuzz = gson.fromJson(s, ResponseModelBuzz.class);
            switch(responseModelBuzz.getTYPE())
            {
                case -1:
                    actionIncomplete = false;
                    TextToSpeech("의사랑 예약서버 에러입니다. 죄송합니다.");
                    break;
                case 0:
                    actionIncomplete = true;
                    TextToSpeech(responseModelBuzz.getTEXT());
                    break;
                case 1:
                    actionIncomplete = false;
                    TextToSpeech(responseModelBuzz.getTEXT());
                default:
                    return;
            }
        }
    }

    @Override
    public void onReady() {

    }

    @Override
    public void onBeginningOfSpeech() {

    }

    @Override
    public void onEndOfSpeech() {

    }

    @Override
    public void onError(int errorCode, String errorMsg) {

    }

    @Override
    public void onPartialResult(String partialResult) {

    }

    @Override
    public void onResults(Bundle results) {

    }

    @Override
    public void onAudioLevel(float audioLevel) {

    }

    @Override // TTS가 완료되면 호출됨
    public void onFinished() {
        if(actionIncomplete) {
            SpeechToText();
            actionIncomplete = false;
        }
    }

    @Override
    public void onPointerCaptureChanged(boolean hasCapture) {

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        switch (requestCode) {
            case REQUEST_CODE_AUDIO_AND_WRITE_EXTERNAL_STORAGE:
                if (grantResults.length > 1 && grantResults[0] == PackageManager.PERMISSION_GRANTED && grantResults[1] == PackageManager.PERMISSION_GRANTED) {

                } else {
                    finish();
                }
                break;
            default:
                break;
        }
    }

    // Kakao API 사용 시 필요한 hash를 얻기 위한 메소드
    public static String getKeyHash(final Context context) {
        PackageInfo packageInfo = getPackageInfo(context, PackageManager.GET_SIGNATURES);
        if (packageInfo == null)
            return null;

        for (Signature signature : packageInfo.signatures) {
            try {
                MessageDigest md = MessageDigest.getInstance("SHA");
                md.update(signature.toByteArray());
                return Base64.encodeToString(md.digest(), Base64.NO_WRAP);
            } catch (NoSuchAlgorithmException e) {
                Log.w("main", "Unable to get MessageDigest. signature=" + signature, e);
            }
        }
        return null;
    }

    private void MessageBox(String s)
    {
        AlertDialog.Builder alert = new AlertDialog.Builder(MainActivity.this);
        alert.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                dialogInterface.dismiss();
            }
        });
        alert.setMessage(s);
        alert.show();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        SpeechRecognizerManager.getInstance().finalizeLibrary();
        TextToSpeechManager.getInstance().finalizeLibrary();
    }
}
