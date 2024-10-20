document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); 
    const emailDisplay = document.getElementById('email-display');
    const loginButton = document.getElementById('login-button');

    if (loggedInUser) {
        emailDisplay.textContent = loggedInUser;
        emailDisplay.style.display = 'block'; 
        loginButton.style.display = 'none'; 
    } else {
        emailDisplay.style.display = 'none'; 
        loginButton.style.display = 'block'; 
    }
});

// 로그인 페이지로 이동하는 함수
function goToLogin() {
    window.location.href = 'kobelogin.html'; // 로그인 페이지 경로 설정
}

// 메인으로 버튼 클릭 시 이동하는 함수
function goToMain() {
    window.location.href = 'kobetop.html'; // 메인으로 가는 경로 설정
}

document.addEventListener('DOMContentLoaded', function() {
    const dialogText = "ようこそ。どのカフェを探していますか？スタイルとサービスの中から選んでください。";
    const dialogElement = document.getElementById('dialog-text');
    const userTextElement = document.getElementById('user-text');

    function typeWriter(text, element, delay = 50) {
        let index = 0;
        element.innerHTML = '';
        const interval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
            } else {
                clearInterval(interval);
            }
        }, delay);
    }

    typeWriter(dialogText, dialogElement);

    let isRecording = false;
    let recordingInProgress = false;
    let isRetrying = false;

    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;

    window.toggleRecording = function() {
        const recordButton = document.getElementById('record-btn');
        const retryButton = document.getElementById('retry-btn');
        if (recordingInProgress) {
            showModal('返事を完了しました。');
            setTimeout(() => {
                document.getElementById('next-btn').style.display = 'block';
                retryButton.style.display = 'block'; 
                recordButton.style.display = 'none'; 
            }, 1000);
            mediaRecorder.stop();
            recordingInProgress = false;
        } else if (isRecording) {
            showModal('返事を完了しました。');
            mediaRecorder.stop();
            recordingInProgress = true;
        } else {
            showModal('音声でお答えください！');
            recordButton.textContent = 'お返事終わりです！';
            startRecording();
            recordingInProgress = true;
            isRecording = true;
        }
    };

    window.retryRecording = function() {
        if (!isRetrying) {
            showRetryModal('もう一度答えますか？');
            isRetrying = true;
        }
    };

    window.goToNext = function() {
        // GPT 엔드포인트 호출 후, 응답을 받아 newlistB로 넘어가도록 처리
        fetch('https://koca.sekoaischool.com/api/GPT', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transcript: userTextElement.textContent // 녹음에서 얻은 텍스트를 전송
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('GPT 응답:', data);

            // GPT 응답 데이터를 세션 스토리지에 저장하여 newlistB 페이지에서 사용
            sessionStorage.setItem('gptResponse', JSON.stringify(data));

            // aId를 세션에 저장
            sessionStorage.setItem('aId', data.aId);

            // newlistB 페이지로 이동
            window.location.href = 'newlistB.html';
        })
        .catch(error => {
            console.error('GPT 호출 실패:', error);
            alert('GPT呼び出しに失敗しました。 もう一度お願いします。');
        });
    };

    window.showModal = function(message) {
        document.getElementById('alert-message').textContent = message;
        document.getElementById('custom-alert').style.display = 'block';
        window.addEventListener('keydown', handleModalKeydown);
    };

    window.showRetryModal = function(message) {
        document.getElementById('retry-message').textContent = message;
        document.getElementById('retry-alert').style.display = 'flex';
        window.addEventListener('keydown', handleModalKeydown);
    };

    window.closeModal = function(event) {
        if (event) {
            event.preventDefault();
        }
        document.getElementById('custom-alert').style.display = 'none';
        window.removeEventListener('keydown', handleModalKeydown);
        if (isRetrying) {
            showRetryModal('もう一度答えますか？');
        }
    };

    window.confirmRetry = function() {
        closeRetryModal();
        showModal('答えを始めます。');
        document.getElementById('record-btn').textContent = 'お返事終わり！';
        document.getElementById('record-btn').style.display = 'block';
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('retry-btn').style.display = 'none'; 
        isRecording = true;
        recordingInProgress = true;
        isRetrying = false;
        startRecording();
    };

    window.closeRetryModal = function() {
        document.getElementById('retry-alert').style.display = 'none';
        window.removeEventListener('keydown', handleModalKeydown);
        isRetrying = false;
    };

    function handleModalKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            closeModal(event);
        }
    }

    window.toggleHelp = function() {
        const helpText = document.getElementById('help-text');
        if (helpText.style.display === 'none' || helpText.style.display === '') {
            helpText.style.display = 'block';
        } else {
            helpText.style.display = 'none';
        }
    };

    window.goBack = function() {
        window.location.href = 'kobelist.html';
    };

    function startRecording() {
        navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 48000,
                channelCount: 1 // 모노 채널로 설정
            }
        })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // 파일 타입을 webm으로 설정
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
                console.log('청크가 추가되었습니다:', event.data); // 각 청크를 로그로 출력
                console.log('현재 청크 배열:', audioChunks); // 전체 청크 배열 출력
            };

            mediaRecorder.onstop = function() {
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // webm으로 변환
                audioChunks = [];
                
                console.log('최종 오디오 Blob:', audioBlob); // 최종 Blob 파일 출력
            
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm'); // webm 파일로 전송
            
                console.log('전송할 formData:', formData.get('file')); // 전송하는 파일 데이터 출력
            
                fetch('https://koca.sekoaischool.com/api/stt', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`서버 오류: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('서버 응답:', data);
            
                    if (data.transcript && data.transcript.trim() !== '') {
                        userTextElement.textContent = data.transcript;
                    } else {
                        userTextElement.textContent = '認識されたテキストがありません。';
                    }
                })
                .catch(error => {
                    console.error('업로드 실패:', error);
                    userTextElement.textContent = `ログインしていただかないとご利用いただけません！`;
                });
            };
        })
        .catch(error => {
            console.error('대답 실패:', error);
        });
    }
});
