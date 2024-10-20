document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail'); // 로컬 스토리지 키에 따라 가져오기
    const emailDisplay = document.getElementById('email-display');
    // const loginButton = document.getElementById('login-button');
    //const cafeListData = localStorage.getItem('cafeListData'); 
    saveToList();

    if (loggedInUser) {
        // 로그인한 이메일만 표시 (로그인한 이메일 문구 삭제)
        emailDisplay.textContent = `${loggedInUser}`;
        emailDisplay.style.display = 'block'; // 이메일 표시
        // loginButton.style.display = 'none';  // 로그인 버튼 숨기기
    } else {
        emailDisplay.style.display = 'none'; // 이메일 숨기기
        // loginButton.style.display = 'block'; // 로그인 버튼 표시
    }
});

// 메인으로
function goToMain() {
    window.location.href = 'kobetop.html';
}

// Enter 키와 Spacebar 키의 기본 동작을 막는 함수
function preventDefaultForModal(event) {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
    }
}

// 팝업에서 엔터 키와 스페이스바 키를 눌렀을 때 모달을 닫는 함수
function handleModalKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        closeModal();
    }
}

// function confirmDelete() {
//     const checkboxes = document.querySelectorAll('.delete-checkbox');
//     let selectedItems = [];

//     checkboxes.forEach((checkbox, index) => {
//         if (checkbox.checked) {
//             selectedItems.push(index);
//         }
//     });

//     if (selectedItems.length === 0) {
//         showModal('削除する項目を選択してください。');
//         return;
//     }

//     showModal('選択された項目を削除しますか？', true);
// }

function deleteSelectedItems(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('.delete-checkbox');

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkbox.parentElement.remove();
        }
    });

    closeModal();
}

function showModal(message, confirm = false) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'block';

    const modalContent = document.querySelector('.modal-content');

    const buttons = document.querySelectorAll('.modal-content button');
    buttons.forEach(button => button.remove());

    if (confirm) {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('modal-buttons');

        const confirmButton = document.createElement('button');
        confirmButton.textContent = '確認';
        confirmButton.onclick = function(event) {
            event.preventDefault();
            deleteSelectedItems(event);
        };
        buttonContainer.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'キャンセル';
        cancelButton.onclick = function(event) {
            event.preventDefault();
            closeModal();
        };
        buttonContainer.appendChild(cancelButton);

        modalContent.appendChild(buttonContainer);
    } else {
        const okButton = document.createElement('button');
        okButton.textContent = '確認';
        okButton.onclick = function(event) {
            event.preventDefault();
            closeModal();
        };
        modalContent.appendChild(okButton);
    }

    // 모달이 열려 있을 때 기본 동작을 막는 이벤트 리스너 추가
    window.addEventListener('keydown', preventDefaultForModal);
    window.addEventListener('keydown', handleModalKeydown); // 엔터 키와 스페이스바 처리 리스너 추가
}

function closeModal(event) {
    if (event) {
        event.preventDefault();
    }

    document.getElementById('custom-alert').style.display = 'none';

    const buttons = document.querySelectorAll('.modal-content button');
    buttons.forEach(button => button.remove());

    // 모달이 닫힐 때 이벤트 리스너 제거
    window.removeEventListener('keydown', preventDefaultForModal);
    window.removeEventListener('keydown', handleModalKeydown); // 엔터 키와 스페이스바 처리 리스너 제거
}

function saveToList() {
    const formData = new FormData();
    fetch("https://koca.sekoaischool.com/api/getCafeList", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: formData // 필요한 데이터가 있다면 여기에 추가
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("ネットワークの応答が良くありません。");
        }
        return response.json();
    })
    .then(result => {
        console.log(result.cafes); // 서버로부터 받은 카페 정보 출력

        // 버튼을 동적으로 생성하는 함수 호출
        createButtonsFromData(result);
    })
    .catch(error => {
        console.error("오류 발생:", error);
        alert("カフェ情報を取得中にエラーが発生しました。");
    });
}

function createButtonsFromData(data) {
    const buttonContainer = document.getElementById('buttonContainer');

    data.cafes.forEach((cafe, index) => {
        // 버튼 요소 생성
        const button = document.createElement('button');
        button.className = 'list-button';
        button.textContent = `list ${index + 1}`;

        // 버튼에 클릭 이벤트 추가 (필요에 따라 수정)
        button.addEventListener('click', () => {
            toggleCafeDetails(button, cafe); /////////////////////////////추가
            // 각 카페의 상세 정보를 보여주는 함수 호출 또는 페이지 이동
            // 예: showCafeDetails(cafe);
        });

        // 버튼을 컨테이너에 추가
        buttonContainer.appendChild(button);
    });
}

// 카페 상세 정보를 토글하는 함수///////////////////////////////////////

function toggleCafeDetails(button, cafe) {
    // 이미 상세 정보가 있는지 확인
    let details = button.nextElementSibling;

    if (details && details.classList.contains('cafe-details')) {
        // 상세 정보가 이미 있다면 제거
        details.remove();
    } else {
        // 상세 정보가 없으면 추가
        details = document.createElement('div');
        details.className = 'cafe-details';
        details.innerHTML = `
            <p>Cafe Name 1: <span class="highlight-cafe-name"><a href="${cafe.URL1}" target="_blank">${cafe.cafeName1}</span></a></p>
            <p>Cafe Name 2: <span class="highlight-cafe-name"><a href="${cafe.URL2}" target="_blank">${cafe.cafeName2}</span></a></p>
            <p>Cafe Name 3: <span class="highlight-cafe-name"><a href="${cafe.URL3}" target="_blank">${cafe.cafeName3}</span></a></p>
        `;
        
        // 버튼 바로 아래에 상세 정보 추가
        button.after(details);
    }
}
