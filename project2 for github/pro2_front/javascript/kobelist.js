document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); // 로컬 스토리지 키에 따라 가져오기
    const emailDisplay = document.getElementById('email-display');
    const loginButton = document.getElementById('login-button');

    if (loggedInUser) {
        // 로그인한 이메일만 표시 (로그인한 이메일 문구 삭제)
        emailDisplay.textContent = `${loggedInUser}`;
        emailDisplay.style.display = 'block'; // 이메일 표시
        loginButton.style.display = 'none';  // 로그인 버튼 숨기기
    } else {
        emailDisplay.style.display = 'none'; // 이메일 숨기기
        loginButton.style.display = 'block'; // 로그인 버튼 표시
    }
});

// 메인으로 이동하는 함수
function goToMain() {
    window.location.href = 'kobetop.html';
}

// 로그인 페이지로 이동하는 함수
function goToLogin() {
    window.location.href = 'kobelogin.html';
}

// 기존 리스트 불러오기 버튼 클릭 시
function loadExistingList() {
    // showModal("기존 리스트를 불러옵니다."); //경로 쓰면 주석처리
    window.location.href = 'existinglist.html'; //경로
}

// 새로운 리스트 만들기 버튼 클릭 시
function createNewList() {
    // showModal("새로운 리스트를 만듭니다."); //경로 쓰면 주석처리
    window.location.href = 'newlistA.html'; //경로 쓰기
}

// 사용자 정의 모달을 표시하는 함수
function showModal(message) {
    document.getElementById("modal-message").innerText = message;
    document.getElementById("custom-modal").style.display = "block";

    // 키보드 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeydown);
}

// 모달을 닫는 함수
function closeModal() {
    document.getElementById("custom-modal").style.display = "none";

    // 키보드 이벤트 리스너 제거
    document.removeEventListener('keydown', handleKeydown);
}

// 키보드 이벤트 핸들러
function handleKeydown(event) {
    // Enter 키와 Spacebar 키 감지
    if (event.key === 'Enter' || event.key === ' ') {
        closeModal();
    }
}
