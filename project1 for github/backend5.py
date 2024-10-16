from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from databases import Database
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS設定
# 外部からのアクセスを許可するためのミドルウェア設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベースのURL
# 複数のデータベースに接続するためのURL設定
DATABASE_URLS = {
    "personal": "mysql://admin:Seigakushakorea0308(!@localhost/boardDB1_njh2", #localhostに接続
    "team": "mysql://admin:Seigakushakorea0308(!@localhost/boardDB2_njh2",
    "overall": "mysql://admin:Seigakushakorea0308(!@localhost/boardDB3_njh2"
}

# データベース接続
# 各データベースに接続
databases = {
    "personal": Database(DATABASE_URLS["personal"]),
    "team": Database(DATABASE_URLS["team"]),
    "overall": Database(DATABASE_URLS["overall"])
}

# 日本時間を取得する関数
# UTCから9時間追加して日本時間を返す
def get_japan_time():
    return datetime.utcnow() + timedelta(hours=9)

# firstmessagesのベースモデル設定
# データベースのテーブル構造に対応するモデル定義
class FirstMessages(BaseModel):
    purposeIdx: str
    message: str
    mean: float
    meanAddPhrase: float
    meanAddMor: float
    meanAddAll: float
    runningTime: str
    createDate: datetime = Field(default_factory=get_japan_time) # 日本時間で自動設定
    yesValue: float
    noValue: float
    confirmStatus: bool = False

# sendDate用のモデル
class SendDate(BaseModel):
    SendDate: datetime

# answerMessagesモデル定義
class AnswerMessages(BaseModel):
    answerId: str
    messageId: str
    answer: str
    mean: float
    meanAddPhrase: float
    meanAddMor: float
    sendDate: datetime
    receiveDate: datetime = Field(default_factory=get_japan_time) # 日本時間で自動設定
    yesOrNo: bool

# メッセージIDを生成する関数
async def generate_new_message_id():
    query = "SELECT messageId FROM firstmessages ORDER BY createDate DESC LIMIT 1"
    last_message = await databases["personal"].fetch_one(query)
    
    if last_message:
        last_message_id = last_message["messageId"]
       # ログ出力 (messageIdの確認)
        print(f"Last messageId: {last_message_id}")

        # messageIdの形式が正しいか確認
        try:
            team_number, person_number, count = map(int, last_message_id.split("-")) # IDを分割して各要素を取得
            new_count = count + 1
        except ValueError as e:
            print(f"Error splitting messageId: {e}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Internal server error",
                    "message": "データベース内のmessageIdの形式が無効です。"
                }
            )
    else:
        team_number, person_number, new_count = 2, 2, 1  # 初期値設定

    new_message_id = f"{team_number}-{person_number}-{new_count}"
    return new_message_id

# データベースに接続
@app.on_event("startup")
# サーバーが起動した時に各データベースに接続する
async def startup():
    for db in databases.values():
        await db.connect()

# 全体データの取得 (3)
@app.get("/alldatas")
# 全体データベースからmessageIdとmessageを取得
async def get_all_datas():
    try:
        query = "SELECT messageId, message FROM firstmessages"
        datas = await databases["overall"].fetch_all(query)
        if not datas:
            raise HTTPException(status_code=404, detail="データが見つかりません")
        return datas
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "内部サーバーエラー",
                "message": "予期しないエラーが発生しました。後でもう一度お試しください。"
            })

# チームデータの取得 (2)
@app.get("/teamdatas")
# チームデータベースからmessageIdとmessageを取得
async def get_team_datas():
    try:
        query = "SELECT messageId, message FROM firstmessages"
        datas = await databases["team"].fetch_all(query)
        if not datas:
            raise HTTPException(status_code=404, detail="データが見つかりません")
        return datas
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "内部サーバーエラー",
                "message": "予期しないエラーが発生しました。後でもう一度お試しください。"
            })

# 個人データの取得 (1)
@app.get("/personaldatas")
# 個人データベースからfirstmessagesとanswermessagesテーブルを取得
async def get_personal_datas():
    try:
        query1 = "SELECT * FROM firstmessages"
        query2 = "SELECT * FROM answermessages"
        data1 = await databases["personal"].fetch_all(query1)
        data2 = await databases["personal"].fetch_all(query2)
        if not data1 and not data2:
            raise HTTPException(status_code=404, detail="データが見つかりません")

        # firstMessagesとanswerMessagesのデータを返す (フィールドを整合)
        return {
            "firstMessages": [
                {
                    "messageId": d["messageId"],
                    "purposeIdx": d["purposeIdx"],
                    "message": d["message"],
                    "mean": d["mean"],
                    "meanAddPhrase": d["meanAddPhrase"],
                    "meanAddMor": d["meanAddMor"],
                    "meanAddAll": d["meanAddAll"],
                    "runningTime": d["runningTime"],
                    "sendDate": d["sendDate"],
                    "receiveDate": d["receiveDate"],
                    "yesValue": d["yesValue"],
                    "noValue": d["noValue"],
                    "confirmStatus": d["confirmStatus"]
                }
                for d in data1
            ],
            "answerMessages": [
                {
                    "answerId": d["answerId"],
                    "messageId": d["messageId"],
                    "answer": d["answer"],
                    "mean": d["mean"],
                    "meanAddPhrase": d["meanAddPhrase"],
                    "meanAddMor": d["meanAddMor"],
                    "meanAddAll": d["meanAddAll"],
                    "sendDate": d["sendDate"],
                    "receiveDate": d["receiveDate"],
                    "yesValue": d["yesValue"],
                    "noValue": d["noValue"],
                    "confirmStatus": d["confirmStatus"]
                }
                for d in data2
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "内部サーバーエラー",
                "message": "予期しないエラーが発生しました。後でもう一度お試しください。"
            })

# データ登録機能 (4)
# 新しいデータをPOSTメソッドで登録
@app.post("/post")
async def post_data(data: FirstMessages):
    try:
        new_message_id = await generate_new_message_id()

        insert_query = """
        INSERT INTO firstmessages (messageId, purposeIdx, message, mean, meanAddPhrase, meanAddMor, meanAddAll, runningTime, createDate, yesValue, noValue, confirmStatus)
        VALUES (:messageId, :purposeIdx, :message, :mean, :meanAddPhrase, :meanAddMor, :meanAddAll, :runningTime, :createDate, :yesValue, :noValue, :confirmStatus)
        """
        values = data.dict()
        values["messageId"] = new_message_id
        values["createDate"] = get_japan_time()

        # ログ出力 (挿入するデータの確認)
        print(f"Inserting data: {values}")

        # 各データベースにクエリを実行
        for db in databases.values():
            await db.execute(insert_query, values=values)

        return {"message": "データが正常に作成されました", "messageId": new_message_id}
    except Exception as e:
        # エラーメッセージをログに出力
        print(f"Error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "内部サーバーエラー",
                "message": str(e)
            }
        )

# sendDateの修正機能
# 特定のメッセージのsendDateを日本時間に更新
@app.put("/fixdate/{messageId}")
async def fix_date(messageId: str):
    current_time = get_japan_time()
    query = "UPDATE firstmessages SET sendDate = :sendDate WHERE messageId = :messageId"
    await databases["personal"].execute(query, values={"sendDate": current_time, "messageId": messageId})
    await databases["team"].execute(query, values={"sendDate": current_time, "messageId": messageId})
    await databases["overall"].execute(query, values={"sendDate": current_time, "messageId": messageId})
    return {"message": "送信日が正常に修正されました"}

# メッセージ編集機能
@app.put("/editmessage/{messageId}")
async def edit_message(messageId: str, updated_message: dict):
    query = """
    UPDATE firstmessages
    SET message = :message
    WHERE messageId = :messageId
    """
    values = {
        "messageId": messageId,
        "message": updated_message["message"]  # フロントから送られてくる新しいメッセージ
    }
    try:
        await databases["personal"].execute(query, values)
        return {"message": "メッセージが正常に更新されました"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"エラーが発生しました: {e}"
        )

# データベースから切断
@app.on_event("shutdown")
# サーバーシャットダウン時にデータベース接続を切断
async def shutdown():
    for db in databases.values():
        await db.disconnect()
