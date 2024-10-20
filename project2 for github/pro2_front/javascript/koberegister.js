function signup() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value;
    const marketingConsent = document.getElementById('marketing-consent').checked;

    // 간단한 유효성 검사
    if (!email.includes('@')) {
        alert('E-mailに"@"を含める必要があります。');
        return;
    }

    if (password !== confirmPassword) {
        alert('パスワードが一致しません。');
        return;
    }

    if (!gender) {
        alert('性別を選択してください。');
        return;
    }

    if (!birthdate) {
        alert('生年月日を入力してください。');
        return;
    }

    if (!phone) {
        alert('電話番号を入力してください。');
        return;
    }

    console.log("회원가입 데이터 준비 완료");

    const requestData = {
        name: name,
        email: email,
        pw: password,
        gender: gender === "male" ? 1 : 0,
        birthDate: birthdate,
        phone: phone,
        mkt: marketingConsent ? 1 : 0,
    };

    fetch('https://koca.sekoaischool.com/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log("서버 응답 상태:", response.status);

        if (response.ok) {
            console.log("会員登録成功！");

            showSignupSuccessModal();
        } else {
            return response.json().then(data => {
                alert(`会員登録失敗: ${data.message}`);
                console.error("회원가입 실패:", data.message);
            });
        }
    })
    .catch(error => {
        console.error('회원가입 중 오류 발생:', error);
        alert('会員登録中にエラーが発生しました。 後でもう一度お願いします。');
    });
}

// JavaScript 코드
document.addEventListener('DOMContentLoaded', function() {
    // flatpickr로 date input을 일본어 설정으로 초기화
    flatpickr("#dob", {
        locale: "ja", // 일본어 설정
        dateFormat: "Y-m-d", // 날짜 형식 지정
        altInput: true,      // 보기 좋은 형식으로 표시
        altFormat: "Y年m月d日", // 일본어 형식으로 날짜 표시
    });
});

function showSignupSuccessModal() {
    const modalContent = document.getElementById('alert-message');
    const modal = document.getElementById('custom-alert');

    if (modalContent && modal) {
        modalContent.textContent = '会員登録が完了しました。 ログインページに移動します。';
        modal.style.display = 'flex'; /* 모달 팝업을 보이게 설정 */
        // 키보드 이벤트 리스너 추가
        document.addEventListener('keydown', handleKeydown);
    } else {
        console.error("모달 또는 모달 컨텐츠를 찾을 수 없습니다.");
    }
}

function closeModalAndRedirect() {
    document.getElementById('custom-alert').style.display = 'none';
    window.location.href = 'kobelogin.html';
    // 키보드 이벤트 리스너 제거
    document.removeEventListener('keydown', handleKeydown);
}

function handleKeydown(event) {
    // Enter 키와 Spacebar 키 감지
    if (event.key === 'Enter' || event.key === ' ') {
        closeModalAndRedirect();
    }
}

function cancelSignup() {
    window.history.back();
}
