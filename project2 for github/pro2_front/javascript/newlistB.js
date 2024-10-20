// 로그인 페이지로 이동하는 함수
function goToLogin() {
    window.location.href = 'kobelogin.html'; // 로그인 페이지 경로 설정
}

// 메인으로 버튼 클릭 시 이동하는 함수
function goToMain() {
    window.location.href = 'kobetop.html'; // 메인으로 가는 경로 설정
}

document.addEventListener('DOMContentLoaded', function() {
    // 로컬 스토리지에서 로그인된 사용자 정보를 가져옴
    const loggedInUser = localStorage.getItem('loggedInUserEmail');
    const emailDisplay = document.getElementById('email-display');
    const loginButton = document.getElementById('login-button');

    if (loggedInUser) {
        emailDisplay.textContent = `${loggedInUser}`;
        emailDisplay.style.display = 'block';
        loginButton.style.display = 'none';
    } else {
        emailDisplay.style.display = 'none';
        loginButton.style.display = 'block';
    }

    // 세션 스토리지에서 gptResponse와 aId를 가져오는 부분 추가
    const gptResponse = sessionStorage.getItem('gptResponse');
    // const aId = sessionStorage.getItem('aId');
    const dialogElement = document.getElementById('dialog-text');

    if (gptResponse) {
        const responseData = JSON.parse(gptResponse);
        console.log('newlistB 페이지로 전달된 GPT 응답:', responseData);

        let dialogText = '';

        // 'transcript' 대신 'analysis_result'를 사용하여 분석된 결과를 확인
        if (responseData.analysis_result === "スタイル") {
            dialogText = `スタイルを選択しましたね。次にサービスを選んでください。`;
            createSelectionButtons(responseData.bitems); // bitems가 서비스에 해당
        } else if (responseData.analysis_result === "サービス") {
            dialogText = `サービスを選択しましたね。次にスタイルを選んでください。`;
            createSelectionButtons(responseData.bitems); // bitems가 스타일에 해당
        } else {
            dialogText = "選択したオプションを確認できません。もう一度選んでください。";
        }

        // 한 글자씩 대화 텍스트 출력
        function typeWriter(text, element, delay = 100) {
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
    } else {
        dialogElement.textContent = "GPTの応答データがありません。";
    }
});

// bitems 배열을 사용해 라디오 버튼 생성 (단일 선택)
function createSelectionButtons(bitems) {
    const selectionBox = document.getElementById('selection-box');
    selectionBox.innerHTML = ''; // 기존 선택지 삭제

    bitems.forEach(item => {
        const label = document.createElement('label');
        label.className = 'radio-label'; // 스타일을 위해 클래스 추가

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'selection'; // 같은 그룹에 속하는 라디오 버튼
        input.value = item.content;

        label.appendChild(input);
        label.appendChild(document.createTextNode(item.content));

        selectionBox.appendChild(label);
        selectionBox.appendChild(document.createElement('br')); // 줄바꿈
    });
}

// 모달 열기 (확인 요청 모달)
function openModal() {
    const selectedRadio = document.querySelector('input[name="selection"]:checked');
    if (selectedRadio) {
        document.getElementById('custom-modal').style.display = 'flex';
        // 모달이 열려 있을 때 기본 동작을 막는 이벤트 리스너 추가
        window.addEventListener('keydown', handleModalKeydown);
    } else {
        alert('1 つのオプションを選択します。');
    }
}

// 모달 닫기 (확인 요청 모달)
function closeModal() {
    document.getElementById('custom-modal').style.display = 'none';
    // 모달이 닫힐 때 이벤트 리스너 제거
    window.removeEventListener('keydown', handleModalKeydown);
}

// 선택 확인 후, 결과 모달로 전환 및 체크된 값 서버로 전송
function confirmSelection() {
    const selectedRadio = document.querySelector('input[name="selection"]:checked');
    const formData = new FormData();

    if (selectedRadio) { 
        document.getElementById('custom-modal').style.display = 'none'; // 기존 모달 닫기
        document.getElementById('selected-style-text').textContent = `選択した項目: ${selectedRadio.value}`;
        document.getElementById('result-modal').style.display = 'flex'; // 결과 모달 열기
        // 결과 모달이 열려 있을 때 기본 동작을 막는 이벤트 리스너 추가
        window.addEventListener('keydown', handleModalKeydown);

        // 체크된 값을 /btext 엔드포인트로 전송하는 코드 추가
        const selectedValue = selectedRadio.value;
        const bId = 'bId'; // 실제로 사용자의 선택에 따라 이 값을 설정해야 합니다.
        const content = selectedValue;

        // aId와 함께 /btext 엔드포인트로 전송
        console.log(selectedValue)
        const aId = sessionStorage.getItem('aId');  // 세션 스토리지에서 가져온 aId 값
        fetch(`https://koca.sekoaischool.com/api/btext/${selectedValue}`, { // URL로 넘김
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('サーバー応答:', data);
        })
        .catch(error => {
            console.error('サーバーの転送に失敗:', error);
        });
    }
}

function closeResultModal() {
    const selectedStyleElement = document.querySelector('input[name="selection"]:checked');  // 'view'에서 'selection'으로 변경

    // 선택된 라디오 버튼이 없을 때 처리
    if (!selectedStyleElement) {
        console.error("選択されたスタイルがありません。ラジオ ボタンが選択されていません。");
        alert("スタイルを選択してください。");
        return; // 선택되지 않았으면 함수 종료
    }

    const formData = new FormData();
    const selectedStyle = selectedStyleElement.value;

    document.getElementById('result-modal').style.display = 'none';
    window.removeEventListener('keydown', handleModalKeydown);

    // 선택한 값을 /ctext 엔드포인트로 전송하는 코드 추가
    fetch('https://koca.sekoaischool.com/api/ctext', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: formData
        // body: JSON.stringify({ selectedStyle: selectedStyle })
    })
    .then(response => response.json())
    .then(data => {
        console.log('서버 응답:', data);

        // 서버 응답에서 Ctext 값을 추출
        const c = data.Ctext;
        console.log('Ctext:', c);

        // Ctext 값을 localStorage에 저장
        localStorage.setItem('Ctext', c);

        // 페이지 이동
        window.location.href = 'newlistC.html'; 
    })
    .catch(error => {
        console.error('서버 전송 실패:', error);
    });
}

// 뒤로 버튼 클릭 시 이전 페이지로 이동
function goBack() {
    window.location.href = 'newlistA.html';
}

// 팝업에서 엔터 키와 스페이스바 키를 눌렀을 때 모달을 닫는 함수
function handleModalKeydown(event) {
    if (event.key === 'Enter') {
        // 확인 버튼 클릭과 동일한 동작
        if (document.getElementById('custom-modal').style.display === 'flex') {
            confirmSelection();
        } else if (document.getElementById('result-modal').style.display === 'flex') {
            closeResultModal();
        }
    } else if (event.key === ' ') {
        event.preventDefault();  // 스페이스바의 기본 동작(페이지 스크롤)을 막음
        // 확인 버튼 클릭과 동일한 동작
        if (document.getElementById('custom-modal').style.display === 'flex') {
            confirmSelection();
        } else if (document.getElementById('result-modal').style.display === 'flex') {
            closeResultModal();
        }
    }
}
