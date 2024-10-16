document.addEventListener("DOMContentLoaded", function() {
    const postButton = document.getElementById("post");
    const refreshButton = document.getElementById("refresh");

    // 「投稿」ボタンをクリックした時の処理
    postButton.addEventListener("click", async function() {
        // 各入力フィールドの値を取得
        const purpose = document.getElementById("purpose").value;
        const message = document.getElementById("message").value;
        const mean = parseFloat(document.getElementById("mean").value);
        const meanAddPhrase = parseFloat(document.getElementById("meanAddPhrase").value);
        const meanAddMor = parseFloat(document.getElementById("meanAddMor").value);
        const meanAddAll = parseFloat(document.getElementById("meanAddAll").value);
        const runningTime = document.getElementById("runningTime").value;
        const yesValue = parseFloat(document.getElementById("yesValue").value);
        const noValue = parseFloat(document.getElementById("noValue").value);
        const confirmStatus = false; // HTML inputから confirmStatusを取得しないため、falseに固定

        // POSTリクエストで送信するデータをオブジェクトとしてまとめる
        const data = {
            purposeIdx: purpose,
            message: message,
            mean: mean,
            meanAddPhrase: meanAddPhrase,
            meanAddMor: meanAddMor,
            meanAddAll: meanAddAll,
            runningTime: runningTime,
            yesValue: yesValue,
            noValue: noValue,
            confirmStatus: confirmStatus
        };

        // データをサーバーにPOSTリクエストとして送信する
        try {
            const response = await fetch("http://57.180.41.44:5002/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // JSON形式で送信することを示す
                },
                body: JSON.stringify(data) // データをJSON文字列に変換して送信
            });

            if (response.ok) {
                // サーバーからのレスポンスが成功した場合
                const result = await response.json();
                alert(`データが正常に作成されました。Message ID: ${result.messageId}`);
                fetchPersonalData(); // データ登録後に個人データを更新
                fetchTeamData(); // データ登録後にチームデータを更新
                fetchAllData(); // データ登録後に全体データを更新
            } else {
                // サーバーからのレスポンスがエラーだった場合
                const errorData = await response.json();
                alert(`エラー: ${errorData.message}`);
            }
        } catch (error) {
            // 予期しないエラーが発生した場合
            alert(`予期しないエラー: ${error.message}`);
        }
    });

    // 「リフレッシュ」ボタンをクリックした時の処理
    refreshButton.addEventListener("click", function() {
        fetchPersonalData(); // 個人データを取得
        fetchTeamData(); // チームデータを取得
        fetchAllData(); // 全体データを取得
    });

    // ページロード時に最初にデータを取得
    fetchPersonalData();
    fetchTeamData();
    fetchAllData();
});

// 個人データをサーバーから取得してテーブルに表示する関数
async function fetchPersonalData() {
    try {
        const response = await fetch("http://57.180.41.44:5002/personaldatas"); // サーバーから個人データを取得
        const data = await response.json(); // レスポンスをJSON形式に変換

        // テーブルのヘッダーを設定
        const personalTable = document.getElementById("personaltable");
        personalTable.innerHTML = "<tr><th>Message ID</th><th>Purpose</th><th>Message</th><th>Mean</th><th>Mean+Phrase</th><th>Mean+Morpheme</th><th>Mean+Phrase+Morpheme</th><th>Run Time</th><th>Send Date</th><th>Receive Date</th><th>Yes value</th><th>No Value</th><th>Yes or No</th><th>Edit</th></tr>";

        const messageMap = {}; // メッセージIDをキーとするマップを初期化

        // firstMessagesをソートしてテーブルに追加
        data.firstMessages.sort((a, b) => parseInt(a.messageId.replace(/-/g, '')) - parseInt(b.messageId.replace(/-/g, '')));
        data.firstMessages.forEach(item => {
            const row = personalTable.insertRow(); // 新しい行を追加
            row.insertCell(0).textContent = item.messageId; // Message ID
            row.insertCell(1).textContent = item.purposeIdx; // Purpose
            row.insertCell(2).textContent = item.message; // Message
            row.insertCell(3).textContent = item.mean; // Mean
            row.insertCell(4).textContent = item.meanAddPhrase; // Mean+Phrase
            row.insertCell(5).textContent = item.meanAddMor; // Mean+Morpheme
            row.insertCell(6).textContent = item.meanAddAll; // Mean+Phrase+Morpheme
            row.insertCell(7).textContent = item.runningTime ? item.runningTime : "N/A"; // Running Time
            row.insertCell(8).textContent = item.sendDate ? item.sendDate : ""; // Send Date
        
            // Receive Dateのボタンを追加
            const receiveDateCell = row.insertCell(9);
            const sendButton = document.createElement("button");
            sendButton.textContent = "send";
            sendButton.addEventListener("click", function() {
                fixSendDate(item.messageId); // 日付固定の関数を呼び出し
            });
            receiveDateCell.appendChild(sendButton); // ボタンをセルに追加
        
            row.insertCell(10).textContent = item.yesValue; // Yes value
            row.insertCell(11).textContent = item.noValue; // No Value
            row.insertCell(12).textContent = item.confirmStatus ? "yes" : "no"; // Yes or No 状態
        
            // Editボタンを追加する部分
            const actionCell = row.insertCell(13); // Editボタン用セルを追加
            const editButton = document.createElement("button");
            editButton.textContent = "Edit"; // Editボタンのテキスト
            editButton.addEventListener("click", function() {
                editMessage(item.messageId); // メッセージ編集関数を呼び出し
            });
            actionCell.appendChild(editButton); // Editボタンをセルに追加

            // メッセージIDをキーとしてマップに保存
            if (!messageMap[item.messageId]) {
                messageMap[item.messageId] = [];
            }
            messageMap[item.messageId].push(row); // 各messageIdに対応する行を保存
        });

        // 各firstMessageの下に対応するanswerMessagesを追加
        data.answerMessages.sort((a, b) => parseInt(a.answerId.replace(/-/g, '')) - parseInt(b.answerId.replace(/-/g, ''))); // answerIdを基準にソート
        data.answerMessages.forEach(item => {
            const row = personalTable.insertRow(); // 新しい行を追加
            row.insertCell(0).textContent = item.answerId; // answerIdを使用
            row.insertCell(1).textContent = "▶"; // 空白に設定
            row.insertCell(2).textContent = item.answer; // Answer
            row.insertCell(3).textContent = item.mean; // Mean
            row.insertCell(4).textContent = item.meanAddPhrase; // Mean+Phrase
            row.insertCell(5).textContent = item.meanAddMor; // Mean+Morpheme
            row.insertCell(6).textContent = item.meanAddAll; // Mean+Phrase+Morpheme
            row.insertCell(7).textContent = item.runningTime; // Running Time
            row.insertCell(8).textContent = item.sendDate; // Send Date
            row.insertCell(9).textContent = item.receiveDate; // Receive Date
            row.insertCell(10).textContent = item.yesValue; // Yes value
            row.insertCell(11).textContent = item.noValue; // No Value
            row.insertCell(12).textContent = item.confirmStatus ? "yes" : "no"; // Yes or No 状態
            
            // 対応するmessageIdとマッチさせて親行の下に追加
            const parentMessageRows = messageMap[item.messageId]; // answerMessagesのmessageIdと合うfirstMessageを探す
            if (parentMessageRows) {
                const lastParentRow = parentMessageRows[parentMessageRows.length - 1]; // 親メッセージの最後の行を探す
                lastParentRow.parentNode.insertBefore(row, lastParentRow.nextSibling); // 親メッセージの下に挿入
                parentMessageRows.push(row); // 追加されたanswerMessage行も保存
            }
        });
    } catch (error) {
        console.error("個人データの取得エラー:", error);
    }
}

// 日付固定機能（メッセージidをエンドポイントとして基準にする）
async function fixSendDate(messageId) {
    try {
        const response = await fetch(`http://57.180.41.44:5002/fixdate/${messageId}`, {
            method: "PUT"
        });

        if (response.ok) {
            alert(`Message ID: ${messageId}の送信日が固定されました`);
            fetchPersonalData(); // データ更新
        } else {
            const errorData = await response.json();
            alert(`エラー: ${errorData.message}`); // エラー発生時、エラーデータ
        }
    } catch (error) {
        alert(`予期しないエラー: ${error.message}`); // サーバーエラーまたはデータエラー以外の予期しないエラー発生時
    }
}

// チームデータを取得してテーブルに表示する関数
async function fetchTeamData() {
    try {
        const response = await fetch("http://57.180.41.44:5002/teamdatas"); // サーバーからチームデータを取得
        const data = await response.json(); // レスポンスをJSON形式に変換

        // テーブルのヘッダーを設定
        const teamTable = document.getElementById("teamtable");
        teamTable.innerHTML = "<tr><th>Message Id</th><th>Message</th></tr>";

        data.forEach(item => {
            const row = teamTable.insertRow(); // 新しい行を追加
            row.insertCell(0).textContent = item.messageId; // Message ID
            row.insertCell(1).textContent = item.message; // Message
        });
    } catch (error) {
        console.error("チームデータの取得エラー:", error);
    }
}

// 全体データを取得してテーブルに表示する関数
async function fetchAllData() {
    try {
        const response = await fetch("http://57.180.41.44:5002/alldatas");    // 全体データ取得用エンドポイント
        const data = await response.json(); // レスポンスをJSON形式に変換

        // テーブルのヘッダーを設定
        const allTable = document.getElementById("alltable");
        allTable.innerHTML = "<tr><th>Message Id</th><th>Message</th></tr>";

        data.forEach(item => {
            const row = allTable.insertRow(); // 新しい行を追加
            row.insertCell(0).textContent = item.messageId; // Message ID
            row.insertCell(1).textContent = item.message; // Message
        });
    } catch (error) {
        console.error("全体データの取得エラー:", error);
    }
}

// Editボタンを各メッセージに追加する処理
data.firstMessages.forEach(item => {
    const row = personalTable.insertRow(); // 新しい行を追加
    row.insertCell(0).textContent = item.messageId; // Message ID

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function() {
        editMessage(item.messageId); // メッセージ編集関数を呼び出し
    });

    const actionCell = row.insertCell(13); // Editボタン用のセルを作成
    actionCell.appendChild(editButton); // Editボタンを追加
});

// メッセージを編集する例の関数
async function editMessage(messageId) {
    const newMessage = prompt("新しいメッセージ内容を入力してください:"); // 新しいメッセージを入力するプロンプト
    if (newMessage) {
        try {
            const response = await fetch(`http://57.180.41.44:5002/editmessage/${messageId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }, // JSON形式で送信
                body: JSON.stringify({ message: newMessage }) // 新しいメッセージを送信
            });

            if (response.ok) {
                alert("メッセージが正常に更新されました。");
                fetchPersonalData(); // テーブルのデータを更新
            } else {
                alert("メッセージの更新に失敗しました。");
            }
        } catch (error) {
            alert(`予期しないエラー: ${error.message}`);
        }
    }
}
