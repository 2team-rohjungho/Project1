document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); // 로컬 스토리지 키 수정
    const emailDisplay = document.getElementById('email-display');
    const logoutLink = document.getElementById('logout-link');
    const loginLink = document.getElementById('login-link');
    const changePasswordLink = document.getElementById('change-password-link');

    if (loggedInUser) {
        // 로그인한 이메일만 표시
        emailDisplay.textContent = `${loggedInUser}`;
        emailDisplay.style.display = 'block'; // 로그인한 경우 이메일 표시
        logoutLink.style.display = 'block'; // 로그아웃 버튼 보이기
        changePasswordLink.style.display = 'block'; // 비밀번호 변경 링크 보이기
        loginLink.style.display = 'none'; // 로그인 버튼 숨기기
    } else {
        // 로그인하지 않은 경우 이메일 숨김
        emailDisplay.style.display = 'none'; // 로그인하지 않은 경우 이메일 숨김
        logoutLink.style.display = 'none'; // 로그아웃 버튼 숨기기
        changePasswordLink.style.display = 'none'; // 비밀번호 변경 링크 숨기기
        loginLink.style.display = 'block'; // 로그인 버튼 보이기
    }
});


function logout() {
    // 로컬 스토리지에서 사용자 정보를 삭제하고 로그인 페이지로 이동
    localStorage.removeItem('loggedInUserEmail'); // 로컬 스토리지 키 수정
    window.location.href = 'kobelogin.html';
}

function goToLogin() {
    // 로그인 페이지로 이동
    window.location.href = 'kobelogin.html';
}

function changePassword() {
    // 비밀번호 변경 페이지로 이동
    window.location.href = 'changepw.html'; 
}

function enter() {
    // "들어가기" 버튼 클릭 시 모달 팝업을 표시하는 함수 호출
    showModal('カフェリストへようこそ！');
    
    // 1초 후에 카페 리스트 페이지로 이동
    setTimeout(function() {
        window.location.href = 'kobelist.html';
    }, 900); // 1000 밀리초 = 1초
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
    // 모달 닫을 때 페이지 이동
    window.location.href = 'kobelist.html'; 
    // 키보드 이벤트 리스너 제거
    document.removeEventListener('keydown', handleKeydown);
}

// 모달의 확인 버튼에 이벤트 리스너 추가
document.querySelector('.modal-content button').addEventListener('click', closeModal);

// 사이드 메뉴를 열고 닫는 함수
function toggleMenu() {
    var menu = document.getElementById("side-menu");
    var menuBtn = document.getElementById("menu-btn");
    
    if (menu.style.width === "250px") {
        menu.style.width = "0"; // 사이드 메뉴 닫기
        menuBtn.style.display = "block"; // 햄버거 버튼 보이기
    } else {
        menu.style.width = "250px"; // 사이드 메뉴 열기
        menuBtn.style.display = "none"; // 햄버거 버튼 숨기기
    }
}

// 키보드 이벤트 처리 함수
function handleKeydown(event) {
    // Enter 키와 Spacebar 키 감지
    if (event.key === 'Enter' || event.key === ' ') {
        closeModal();
    }
}
