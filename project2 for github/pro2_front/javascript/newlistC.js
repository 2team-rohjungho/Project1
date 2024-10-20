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

// 로그인 페이지로 이동하는 함수
function goToLogin() {
    window.location.href = 'kobelogin.html'; // 로그인 페이지 경로 설정
}

// 메인으로 버튼 클릭 시 이동하는 함수
function goToMain() {
    window.location.href = 'kobetop.html'; // 메인으로 가는 경로 설정
}

document.addEventListener('DOMContentLoaded', function() {
    const dialogElement = document.getElementById('dialog-text');

    // localStorage에서 Ctext 데이터를 가져옴
    const ctextResponse = localStorage.getItem('Ctext');
    console.log("localStorage에서 가져온 Ctext:", ctextResponse);  // localStorage에서 가져온 데이터 확인

    let dialogText = "雰囲気のいい音楽が流れてレトロな感じのカフェを探してみます。"; // 기본값

    // Ctext가 있으면 대화문을 해당 값으로 설정
    if (ctextResponse) {
        dialogText = ctextResponse;  // Ctext 값을 dialogText에 할당
        console.log("서버 응답에서 추출한 Ctext:", dialogText);  // 서버에서 받은 대화문 확인
    }

    // 대화문을 한 글자씩 나타나게 하는 함수
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
});

// 돌아가기 버튼 클릭 시 이전 페이지로 이동
function goBack() {
    window.location.href = 'newlistB.html';
}

// 이미지 가져오기 및 팝업 열기 로직
async function confirmSelection() {
    try {
        // 로딩 중 팝업 표시
        document.getElementById('loading-popup').style.display = 'flex';
        
        // localStorage에서 가져온 Ctext 값
        const ctextResponse = localStorage.getItem('Ctext');
        console.log("Using Ctext for prompt:", ctextResponse);

        // 백엔드로 전송 (사용자 프롬프트를 포함)
        const response = await fetch('https://koca.sekoaischool.com/api/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: ctextResponse }) // 원본 프롬프트 그대로 전송
        });

        if (!response.ok) {
            throw new Error('画像の生成に失敗しました。');
        }

        const data = await response.json();
        const imageUrl = data.image_url; // 백엔드에서 전달받은 이미지 URL

        // 이미지 팝업 열기
        const imageElement = document.getElementById('myImage');
        imageElement.src = imageUrl;
        imageElement.style.display = 'block';
        document.getElementById('image-message').style.display = 'none';

        // 로딩 중 팝업 숨기기
        document.getElementById('loading-popup').style.display = 'none';

        document.getElementById('popup').style.display = 'flex';
    } catch (error) {
        alert('カフェリスト作成ボタンをもう一度押してください。');
        console.error(error);

        document.getElementById('loading-popup').style.display = 'none';
    }
}



// 팝업창 닫기 기능
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// 카페 리스트 작성 확인 버튼 클릭 시 mycafelist.html로 이동
// function goToLoading() {
//     window.location.href = 'mycafelist.html';
// }
async function goToLoading() {
    // 로딩 중 팝업 표시 (선택적으로 추가)
    document.getElementById('loading-popup').style.display = 'flex';
    const formData = new FormData();

    try {
        // /cafeList 엔드포인트로 폼 데이터 전송
        const response = await fetch('https://koca.sekoaischool.com/api/cafeList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: formData // JSON 형태로 변환하여 전송
        });

        if (!response.ok) {
            throw new Error('カフェリスト作成中にエラーが発生');
        }

        // 응답 처리 (필요시)
        const data = await response.json();
        console.log('서버 응답:', data);

        // 반환된 값을 localStorage에 저장
        localStorage.setItem('cafeListData', JSON.stringify(data)); // 반환된 데이터 저장

        // 페이지 이동
        window.location.href = 'mycafelist.html';
    } catch (error) {
        console.error('カフェリスト作成に失敗:', error);
        alert('リスト作成ボタンをもう一度押してください。');

        // 로딩 중 팝업 숨기기
        document.getElementById('loading-popup').style.display = 'none';
    }
}
/////////////////////////////////////////////////////////////////////////////////////////

// 다운 버튼 클릭 시 이미지 다운로드 기능 추가
async function downloadImage() {
    try {
        // 백엔드에서 생성된 이미지를 가져옴
        const response = await fetch('https://koca.sekoaischool.com/api/image'); // 백엔드에서 실제 이미지 파일을 가져오는 API
        const blob = await response.blob(); // 응답 데이터를 Blob으로 변환

        // Blob URL 생성
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'cafe_image.jpg'; // 파일 이름 설정 (필요에 따라 변경 가능)
        document.body.appendChild(a);
        a.click(); // 클릭 이벤트 발생시켜 다운로드

        // 메모리 해제
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a); // 요소 제거
    } catch (error) {
        console.error('ダウンロード失敗:', error);
        alert('ダウンロードに失敗しました。');
    }
}

// 다운 버튼 클릭 시 실행
document.getElementById('download-btn').addEventListener('click', downloadImage);
