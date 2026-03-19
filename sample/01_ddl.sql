-- ============================================================
-- SNSシステム サンプル テーブル定義
-- ============================================================

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS sns_users (
    user_id       INTEGER PRIMARY KEY,
    username      STRING,
    display_name  STRING,
    bio           STRING,
    follower_count  INTEGER,
    following_count INTEGER,
    created_at    TIMESTAMP
);

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS sns_posts (
    post_id       INTEGER PRIMARY KEY,
    user_id       INTEGER,
    content       STRING,
    like_count    INTEGER,
    repost_count  INTEGER,
    reply_count   INTEGER,
    created_at    TIMESTAMP
);

-- フォローテーブル
CREATE TABLE IF NOT EXISTS sns_follows (
    follow_id   INTEGER PRIMARY KEY,
    follower_id INTEGER,
    followee_id INTEGER,
    followed_at TIMESTAMP
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS sns_likes (
    like_id  INTEGER PRIMARY KEY,
    user_id  INTEGER,
    post_id  INTEGER,
    liked_at TIMESTAMP
);

-- ハッシュタグテーブル
CREATE TABLE IF NOT EXISTS sns_hashtags (
    hashtag_id INTEGER PRIMARY KEY,
    post_id    INTEGER,
    tag        STRING
);

-- アクティビティログ（時系列）
-- action_type: login / logout / post / like / follow / repost
CREATE TABLE IF NOT EXISTS sns_activity_log (
    log_time    TIMESTAMP PRIMARY KEY,
    user_id     INTEGER,
    action_type STRING,
    target_id   INTEGER,
    detail      STRING
) USING TIMESERIES;

-- 時間別統計（時系列）
CREATE TABLE IF NOT EXISTS sns_hourly_stats (
    measured_at  TIMESTAMP PRIMARY KEY,
    total_posts  INTEGER,
    total_likes  INTEGER,
    active_users INTEGER,
    new_follows  INTEGER
) USING TIMESERIES;
