function findPassword() {
    const username = document.getElementById('username').value;

    if (!username) {
        showModal('ID（e-mail）を入力してください。');
        return;
    }

    // 비밀번호 찾기 로직 추가
    showModal('パスワード再設定のリクエストが送信されました。入力したメールを確認してください。');
}

function goBack() {
    window.location.href = 'kobelogin.html';  // 로그인 페이지로 이동
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

function handleKeydown(event) {
    // Enter 키와 Spacebar 키 감지
    if (event.key === 'Enter' || event.key === ' ') {
        closeModal();
    }
}
