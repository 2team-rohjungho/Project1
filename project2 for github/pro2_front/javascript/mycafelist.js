document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); 
    const emailDisplay = document.getElementById('email-display');

    // 로그인한 이메일을 표시
    if (loggedInUser) {
        emailDisplay.textContent = `${loggedInUser}`;
        emailDisplay.style.display = 'block';
    } else {
        emailDisplay.style.display = 'none';
    }

    // localStorage에서 cafeListData를 가져와서 데이터 표시
    const cafeListData = localStorage.getItem('cafeListData');

    // 데이터가 있으면 파싱하여 페이지에 표시
    if (cafeListData) {
        const parsedData = JSON.parse(cafeListData);
        console.log("localStorage에서 가져온 카페 리스트 데이터:", parsedData);

        // 데이터베이스에서 가져온 정보 표시
        const dataDisplay = document.getElementById('data-display');

        // parsedData에서 cafes 객체 가져오기
        const cafes = parsedData.cafes;

        // cafes 객체를 사용하여 데이터를 페이지에 표시
        if (cafes && typeof cafes === 'object') {
            for (const [key, value] of Object.entries(cafes)) {
                const paragraph = document.createElement('p');

                // 카페 이름 부분에 클래스를 추가
                const keySpan = document.createElement('span');
                keySpan.textContent = `${key}: `;
                const valueSpan = document.createElement('span');
                valueSpan.textContent = value;
                valueSpan.classList.add('cafe-name');  // CSS 클래스 추가

                paragraph.appendChild(keySpan);
                paragraph.appendChild(valueSpan);
                dataDisplay.appendChild(paragraph);
            }
        } else {
            console.error('cafes가 객체가 아닙니다:', cafes);
        }
    } else {
        console.error('cafeListData가 localStorage에서 발견되지 않았습니다.');
    }
});


// 메인으로 이동
function goToMain() {
    window.location.href = 'kobetop.html';
}

// 내 리스트에서 카페 정보 가져오기
function saveToList() {
    const formData = new FormData();
    
    // 필요한 데이터를 formData에 추가 (예: formData.append('key', value));

    fetch("https://koca.sekoaischool.com/api/getCafeList", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("ネットワークの応答が良くありません。");
        }
        return response.json();
    })
    .then(result => {
        console.log(result.cafes); // 서버로부터 받은 카페 정보 출력

        // 카페 정보를 localStorage에 저장
        localStorage.setItem('cafeListData', JSON.stringify(result));

        // 카페 정보를 다른 HTML 페이지로 이동하여 표시
        goToList();
    })
    .catch(error => {
        console.error("오류 발생:", error);
        alert("カフェ情報の取得中にエラーが発生しました。");
    });
}

// 나만의 리스트 목록으로 이동
function goToList() {
    window.location.href = 'existinglist.html';
}

// 모달 열기
function showModal(message) {
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';

    // 모달이 열려 있을 때 기본 동작을 막는 이벤트 리스너 추가
    window.addEventListener('keydown', closeOnEnterOrSpace);
}

// 모달 닫기
function closeModal() {
    document.getElementById('custom-modal').style.display = 'none';
    window.removeEventListener('keydown', closeOnEnterOrSpace);
}

// Enter나 Space로 모달 닫기
function closeOnEnterOrSpace(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        closeModal();
    }
}
