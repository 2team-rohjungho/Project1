function login() {
    const email = document.getElementById('username').value;
    const pw = document.getElementById('password').value;

    // 간단한 유효성 검사
    if (!email || !pw) {
        showModal('E-mailとpasswordの両方を入力します。');
        return;
    }

    // 로그인 API 요청 보내기
    fetch('https://koca.sekoaischool.com/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, pw: pw })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('ログインの試行中に問題が発生しました。');
        }
        return response.json();
    })
    .then(data => {
        console.log('서버 응답:', data); // 서버에서 오는 응답을 확인하기 위해 콘솔에 로그

        if (data.message === 'ログイン成功！') {  // 서버의 메시지를 확인
            showModal('ログイン成功！');
            localStorage.setItem('loggedInUserEmail', email);

            // 일정 시간 후 페이지 이동
            autoRedirect();
        } else {
            // 로그인 실패 시
            showModal('メールやパスワードをもう一度ご確認お願いします。');
        }
    })
    .catch(error => {
        // 네트워크 오류 또는 기타 예외 처리
        showModal('エラーが発生しました。: ' + error.message);
    });
}

function autoRedirect() {
    // 모달을 닫는 함수 정의
    const closeAndRedirect = () => {
        document.getElementById('custom-alert').style.display = 'none';
        window.location.href = 'kobetop.html'; // 홈 페이지 경로 설정
    };

    // 모달 확인 버튼에 클릭 이벤트 리스너 추가
    document.querySelector('.modal-content button').addEventListener('click', closeAndRedirect);

    // 2초 후 자동으로 페이지 이동
    setTimeout(() => {
        // 모달이 닫히지 않았으면 자동으로 페이지 이동
        if (document.getElementById('custom-alert').style.display === 'block') {
            closeAndRedirect();
        }
    }, 900); // 2000 밀리초 = 2초
}

function goToSignup() {
    window.location.href = 'koberegister.html'; // 회원가입 페이지로 이동
}

function findPassword() {
    window.location.href = 'password.html'; // 비밀번호 찾기 페이지로 이동
}

function goToMain() {
    window.location.href = 'kobetop.html'; // 메인 페이지로 이동
}

// 모달을 표시하는 함수
function showModal(message) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'block';
    // 키보드 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeydown);
}

// 모달을 닫는 함수
function closeModal() {
    document.getElementById('custom-alert').style.display = 'none';
    // 키보드 이벤트 리스너 제거
    document.removeEventListener('keydown', handleKeydown);
}

// 키보드 이벤트 처리 함수
function handleKeydown(event) {
    // Enter 키와 Spacebar 키 감지
    if (event.key === 'Enter' || event.key === ' ') {
        closeModal();
    }
}

// 모달의 확인 버튼에 이벤트 리스너 추가
document.querySelector('.modal-content button').addEventListener('click', closeModal);
