-- ============================================================
-- SNSシステム 動作確認用サンプルクエリ集
-- ============================================================

-- ------------------------------------------------------------
-- 基本確認
-- ------------------------------------------------------------

-- 全ユーザー一覧
SELECT * FROM sns_users;

-- 全投稿一覧（新しい順）
SELECT * FROM sns_posts ORDER BY created_at DESC;

-- ------------------------------------------------------------
-- COLLECTION 結合クエリ
-- ------------------------------------------------------------

-- 投稿とユーザー名の結合
SELECT
    p.post_id,
    u.display_name,
    u.username,
    p.content,
    p.like_count,
    p.created_at
FROM sns_posts p, sns_users u
WHERE p.user_id = u.user_id
ORDER BY p.created_at DESC;

-- いいね数TOP5の投稿
SELECT
    p.post_id,
    u.display_name,
    p.content,
    p.like_count
FROM sns_posts p, sns_users u
WHERE p.user_id = u.user_id
ORDER BY p.like_count DESC
LIMIT 5;

-- フォロワー数が多いユーザーTOP3
SELECT user_id, display_name, username, follower_count
FROM sns_users
ORDER BY follower_count DESC
LIMIT 3;

-- 特定ユーザー（Eve）の投稿一覧
SELECT p.post_id, p.content, p.like_count, p.created_at
FROM sns_posts p, sns_users u
WHERE p.user_id = u.user_id
AND u.username = 'eve_travel'
ORDER BY p.created_at DESC;

-- ハッシュタグ「タイ」が付いた投稿
SELECT
    p.post_id,
    u.display_name,
    p.content,
    p.like_count
FROM sns_posts p, sns_users u, sns_hashtags h
WHERE p.post_id = h.post_id
AND p.user_id = u.user_id
AND h.tag = 'タイ';

-- 各ユーザーのいいね数合計
SELECT
    u.display_name,
    u.username,
    COUNT(*) AS total_likes_given
FROM sns_likes l, sns_users u
WHERE l.user_id = u.user_id
GROUP BY u.user_id, u.display_name, u.username
ORDER BY total_likes_given DESC;

-- ------------------------------------------------------------
-- TIME_SERIES クエリ
-- ------------------------------------------------------------

-- アクティビティログ全件（時系列順）
SELECT * FROM sns_activity_log ORDER BY log_time ASC;

-- ログイン・ログアウト以外のアクティビティ
SELECT log_time, user_id, action_type, target_id, detail
FROM sns_activity_log
WHERE action_type NOT IN ('login', 'logout')
ORDER BY log_time ASC;

-- 特定時間帯のアクティビティ（08:00〜10:00）
SELECT *
FROM sns_activity_log
WHERE log_time >= TIMESTAMP('2024-01-14T08:00:00.000Z')
AND log_time < TIMESTAMP('2024-01-14T10:00:00.000Z')
ORDER BY log_time ASC;

-- 時間別統計（全件）
SELECT * FROM sns_hourly_stats ORDER BY measured_at ASC;

-- 統計：いいね数が900を超えた時間帯
SELECT measured_at, total_likes, active_users
FROM sns_hourly_stats
WHERE total_likes > 900
ORDER BY measured_at ASC;

-- 統計：アクティブユーザーが最も多かった時間帯
SELECT measured_at, active_users, total_posts, total_likes
FROM sns_hourly_stats
ORDER BY active_users DESC
LIMIT 3;
