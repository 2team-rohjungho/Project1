document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); // 로컬 스토리지 키에 따라 가져오기
    const emailDisplay = document.getElementById('email-display');

    if (loggedInUser) {
        // 로그인한 이메일만 표시 (로그인한 이메일 문구 삭제)
        emailDisplay.textContent = `${loggedInUser}`;
        emailDisplay.style.display = 'block'; // 이메일 표시
    } else {
        emailDisplay.style.display = 'none'; // 이메일 숨기기
    }
});

// 취소 버튼을 눌렀을 때 메인 페이지로 이동하는 함수
function cancelChange() {
    window.location.href = 'kobetop.html';
}

// 확인 버튼을 눌렀을 때 비밀번호 변경 로직을 처리하는 함수
async function confirmChange() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); // 로그인된 이메일 가져오기

    // 비밀번호 필드가 비어 있는지 확인
    if (!currentPassword) {
        showModal('既存のパスワードを入力してください。');
        return;
    }

    if (!newPassword) {
        showModal('新しいパスワードを入力してください。');
        return;
    }

    if (!confirmPassword) {
        showModal('新しいパスワードをもう一度入力してください。');
        return;
    }

    // 새 비밀번호와 확인 비밀번호가 일치하는지 확인
    if (newPassword !== confirmPassword) {
        showModal('新しいパスワードと新しいパスワードの確認が一致しません。');
        return;
    }

    // 비밀번호 변경 API 호출
    try {
        const response = await fetch('https://koca.sekoaischool.com/api/changePw', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: loggedInUser,
                current_pw: currentPassword,
                new_pw: newPassword
            })
        });

        const result = await response.json();

        if (response.ok) {
            showModal('パスワードが正常に変更されました！');
            // 1초 후에 메인 페이지로 이동
            setTimeout(function() {
                window.location.href = 'kobetop.html';
            }, 1000); // 1000 밀리초 = 1초
        } else {
            showModal(result.message || 'パスワードの変更に失敗');
        }
    } catch (error) {
        showModal('サーバーとの接続問題が発生しました。');
    }
}

// 모달을 표시하는 함수
function showModal(message) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'block';

    // 모달이 열려 있을 때 기본 동작을 막는 이벤트 리스너 추가
    window.addEventListener('keydown', handleModalKeydown);
}

// 모달을 닫는 함수
function closeModal(event) {
    if (event) {
        event.preventDefault();
    }

    document.getElementById('custom-alert').style.display = 'none';

    // 모달이 닫힐 때 이벤트 리스너 제거
    window.removeEventListener('keydown', handleModalKeydown);
}

// 팝업에서 엔터 키와 스페이스바 키를 눌렀을 때 모달을 닫는 함수
function handleModalKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();  // 스페이스바의 기본 동작을 막음 (페이지 스크롤 방지)
        closeModal();
    }
}

