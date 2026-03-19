-- ============================================================
-- SNSシステム サンプルデータ挿入
-- ============================================================

-- ------------------------------------------------------------
-- ユーザー（8名）
-- ------------------------------------------------------------
INSERT INTO sns_users VALUES (1, 'alice_dev',    'Alice',    'フルスタックエンジニア🚀 OSS好き',          320,  180, TIMESTAMP('2023-06-01T08:00:00.000Z'));
INSERT INTO sns_users VALUES (2, 'bob_photo',    'Bob',      '写真家📸 風景・ポートレート専門',          1500,   90, TIMESTAMP('2023-06-05T10:30:00.000Z'));
INSERT INTO sns_users VALUES (3, 'carol_music',  'Carol',    '音楽家🎵 作曲・ピアノ・ライブ配信',         890,  210, TIMESTAMP('2023-06-10T14:00:00.000Z'));
INSERT INTO sns_users VALUES (4, 'dave_cook',    'Dave',     '料理研究家🍳 レシピ公開中',                430,  150, TIMESTAMP('2023-07-01T09:00:00.000Z'));
INSERT INTO sns_users VALUES (5, 'eve_travel',   'Eve',      '旅行ブロガー✈️ 30カ国訪問済み',           2100,  340, TIMESTAMP('2023-07-15T11:00:00.000Z'));
INSERT INTO sns_users VALUES (6, 'frank_gamer',  'Frank',    'ゲーマー🎮 FPS・RPG・配信者',              760,  420, TIMESTAMP('2023-08-01T20:00:00.000Z'));
INSERT INTO sns_users VALUES (7, 'grace_art',    'Grace',    'イラストレーター🎨 キャラデザ受付中',      1200,  180, TIMESTAMP('2023-08-20T13:00:00.000Z'));
INSERT INTO sns_users VALUES (8, 'henry_sports', 'Henry',    'スポーツライター⚽ サッカー・野球担当',     540,  260, TIMESTAMP('2023-09-01T07:30:00.000Z'));

-- ------------------------------------------------------------
-- 投稿（12件）
-- ------------------------------------------------------------
INSERT INTO sns_posts VALUES ( 1, 1, 'GridDBをNext.jsから操作できるWeb管理ツールを作ってみました！ #エンジニア #OSS #GridDB',                          45,  8, 3, TIMESTAMP('2024-01-10T09:00:00.000Z'));
INSERT INTO sns_posts VALUES ( 2, 2, '朝霧の中の富士山を撮影しました📸 早起きは三文の徳ですね。 #写真 #富士山 #風景',                                    120, 15, 7, TIMESTAMP('2024-01-10T06:30:00.000Z'));
INSERT INTO sns_posts VALUES ( 3, 3, '新曲を作りました🎵 ピアノとストリングスのアレンジです。ぜひ聴いてみてください！ #音楽 #作曲 #ピアノ',               88,  12, 5, TIMESTAMP('2024-01-10T19:00:00.000Z'));
INSERT INTO sns_posts VALUES ( 4, 4, '今日のレシピ：鶏の唐揚げ＋特製タレ🍳 ポイントはにんにくと生姜を多めに。 #料理 #レシピ #グルメ',                     67,   5, 9, TIMESTAMP('2024-01-11T12:00:00.000Z'));
INSERT INTO sns_posts VALUES ( 5, 5, 'バンコク到着！✈️ 今回は2週間の滞在予定。屋台グルメを堪能します。 #旅行 #タイ #バンコク',                            200,  30, 18, TIMESTAMP('2024-01-11T07:00:00.000Z'));
INSERT INTO sns_posts VALUES ( 6, 6, '新作RPGのラスボス撃破🎮 総プレイ時間80時間...やりごたえあった！ #ゲーム #RPG #クリア',                               54,   7,  4, TIMESTAMP('2024-01-11T23:30:00.000Z'));
INSERT INTO sns_posts VALUES ( 7, 7, 'ファンタジー世界の主人公を描きました🎨 ご依頼はDMへ！ #イラスト #キャラデザ #ファンタジー',                           310,  40, 22, TIMESTAMP('2024-01-12T15:00:00.000Z'));
INSERT INTO sns_posts VALUES ( 8, 8, 'J1第1節レビュー⚽ 今季の注目選手と戦術分析。開幕戦から目が離せない展開でした。 #サッカー #J1 #スポーツ',           78,   9,  6, TIMESTAMP('2024-01-12T21:00:00.000Z'));
INSERT INTO sns_posts VALUES ( 9, 1, 'TypeScript 5.4の新機能まとめ。NoInfer型が便利すぎる件 #エンジニア #TypeScript #技術',                               33,   4,  2, TIMESTAMP('2024-01-13T10:00:00.000Z'));
INSERT INTO sns_posts VALUES (10, 3, 'ライブ配信終了🎵 2時間ありがとうございました！アーカイブは明日公開予定。 #音楽 #ライブ配信',                          72,   6,  8, TIMESTAMP('2024-01-13T22:00:00.000Z'));
INSERT INTO sns_posts VALUES (11, 5, 'チェンマイの寺院巡り完了✈️ ドイステープ寺院からの夕日が最高でした。 #旅行 #タイ #チェンマイ',                         185,  25, 14, TIMESTAMP('2024-01-14T14:00:00.000Z'));
INSERT INTO sns_posts VALUES (12, 7, '春をテーマにした連作イラスト、完成しました🌸 全4枚をスレッドで公開します。 #イラスト #春 #創作',                       420,  55, 31, TIMESTAMP('2024-01-14T11:00:00.000Z'));

-- ------------------------------------------------------------
-- フォロー（16件）
-- ------------------------------------------------------------
INSERT INTO sns_follows VALUES ( 1, 2, 1, TIMESTAMP('2023-10-01T10:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 2, 3, 1, TIMESTAMP('2023-10-02T11:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 3, 4, 1, TIMESTAMP('2023-10-03T09:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 4, 5, 2, TIMESTAMP('2023-10-04T08:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 5, 6, 2, TIMESTAMP('2023-10-05T20:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 6, 7, 2, TIMESTAMP('2023-10-06T15:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 7, 1, 3, TIMESTAMP('2023-10-07T09:30:00.000Z'));
INSERT INTO sns_follows VALUES ( 8, 8, 3, TIMESTAMP('2023-10-08T07:00:00.000Z'));
INSERT INTO sns_follows VALUES ( 9, 1, 4, TIMESTAMP('2023-10-09T12:00:00.000Z'));
INSERT INTO sns_follows VALUES (10, 5, 4, TIMESTAMP('2023-10-10T10:00:00.000Z'));
INSERT INTO sns_follows VALUES (11, 2, 5, TIMESTAMP('2023-10-11T08:00:00.000Z'));
INSERT INTO sns_follows VALUES (12, 3, 5, TIMESTAMP('2023-10-12T19:00:00.000Z'));
INSERT INTO sns_follows VALUES (13, 4, 6, TIMESTAMP('2023-10-13T21:00:00.000Z'));
INSERT INTO sns_follows VALUES (14, 7, 6, TIMESTAMP('2023-10-14T16:00:00.000Z'));
INSERT INTO sns_follows VALUES (15, 5, 7, TIMESTAMP('2023-10-15T13:00:00.000Z'));
INSERT INTO sns_follows VALUES (16, 6, 8, TIMESTAMP('2023-10-16T07:30:00.000Z'));

-- ------------------------------------------------------------
-- いいね（20件）
-- ------------------------------------------------------------
INSERT INTO sns_likes VALUES ( 1, 2,  1, TIMESTAMP('2024-01-10T09:15:00.000Z'));
INSERT INTO sns_likes VALUES ( 2, 3,  1, TIMESTAMP('2024-01-10T09:20:00.000Z'));
INSERT INTO sns_likes VALUES ( 3, 4,  1, TIMESTAMP('2024-01-10T10:00:00.000Z'));
INSERT INTO sns_likes VALUES ( 4, 1,  2, TIMESTAMP('2024-01-10T07:00:00.000Z'));
INSERT INTO sns_likes VALUES ( 5, 5,  2, TIMESTAMP('2024-01-10T07:30:00.000Z'));
INSERT INTO sns_likes VALUES ( 6, 6,  2, TIMESTAMP('2024-01-10T08:00:00.000Z'));
INSERT INTO sns_likes VALUES ( 7, 7,  2, TIMESTAMP('2024-01-10T08:30:00.000Z'));
INSERT INTO sns_likes VALUES ( 8, 1,  3, TIMESTAMP('2024-01-10T19:10:00.000Z'));
INSERT INTO sns_likes VALUES ( 9, 2,  3, TIMESTAMP('2024-01-10T19:20:00.000Z'));
INSERT INTO sns_likes VALUES (10, 5,  4, TIMESTAMP('2024-01-11T12:30:00.000Z'));
INSERT INTO sns_likes VALUES (11, 1,  5, TIMESTAMP('2024-01-11T07:10:00.000Z'));
INSERT INTO sns_likes VALUES (12, 2,  5, TIMESTAMP('2024-01-11T07:20:00.000Z'));
INSERT INTO sns_likes VALUES (13, 3,  5, TIMESTAMP('2024-01-11T07:30:00.000Z'));
INSERT INTO sns_likes VALUES (14, 4,  7, TIMESTAMP('2024-01-12T15:10:00.000Z'));
INSERT INTO sns_likes VALUES (15, 5,  7, TIMESTAMP('2024-01-12T15:20:00.000Z'));
INSERT INTO sns_likes VALUES (16, 6,  7, TIMESTAMP('2024-01-12T15:30:00.000Z'));
INSERT INTO sns_likes VALUES (17, 1, 12, TIMESTAMP('2024-01-14T11:10:00.000Z'));
INSERT INTO sns_likes VALUES (18, 2, 12, TIMESTAMP('2024-01-14T11:20:00.000Z'));
INSERT INTO sns_likes VALUES (19, 3, 12, TIMESTAMP('2024-01-14T11:30:00.000Z'));
INSERT INTO sns_likes VALUES (20, 5, 12, TIMESTAMP('2024-01-14T11:40:00.000Z'));

-- ------------------------------------------------------------
-- ハッシュタグ（18件）
-- ------------------------------------------------------------
INSERT INTO sns_hashtags VALUES ( 1,  1, 'エンジニア');
INSERT INTO sns_hashtags VALUES ( 2,  1, 'OSS');
INSERT INTO sns_hashtags VALUES ( 3,  1, 'GridDB');
INSERT INTO sns_hashtags VALUES ( 4,  2, '写真');
INSERT INTO sns_hashtags VALUES ( 5,  2, '富士山');
INSERT INTO sns_hashtags VALUES ( 6,  3, '音楽');
INSERT INTO sns_hashtags VALUES ( 7,  3, 'ピアノ');
INSERT INTO sns_hashtags VALUES ( 8,  4, '料理');
INSERT INTO sns_hashtags VALUES ( 9,  4, 'レシピ');
INSERT INTO sns_hashtags VALUES (10,  5, '旅行');
INSERT INTO sns_hashtags VALUES (11,  5, 'タイ');
INSERT INTO sns_hashtags VALUES (12,  7, 'イラスト');
INSERT INTO sns_hashtags VALUES (13,  7, 'キャラデザ');
INSERT INTO sns_hashtags VALUES (14,  9, 'TypeScript');
INSERT INTO sns_hashtags VALUES (15,  9, '技術');
INSERT INTO sns_hashtags VALUES (16, 11, 'タイ');
INSERT INTO sns_hashtags VALUES (17, 12, 'イラスト');
INSERT INTO sns_hashtags VALUES (18, 12, '春');

-- ------------------------------------------------------------
-- アクティビティログ（時系列 / 24件）
-- ------------------------------------------------------------
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T06:00:00.000Z'), 5, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T06:05:00.000Z'), 2, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T06:10:00.000Z'), 5, 'post',  11, '投稿ID:11 作成');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T06:15:00.000Z'), 2, 'like',   5, '投稿ID:5 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T07:00:00.000Z'), 1, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T07:05:00.000Z'), 7, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T07:10:00.000Z'), 1, 'like',  11, '投稿ID:11 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T07:15:00.000Z'), 7, 'post',  12, '投稿ID:12 作成');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T07:20:00.000Z'), 3, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T07:30:00.000Z'), 4, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T08:00:00.000Z'), 6, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T08:05:00.000Z'), 3, 'like',  12, '投稿ID:12 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T08:10:00.000Z'), 4, 'follow', 7, 'ユーザーID:7 をフォロー');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T08:15:00.000Z'), 6, 'like',  12, '投稿ID:12 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T09:00:00.000Z'), 8, 'login',  0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T09:05:00.000Z'), 5, 'like',  12, '投稿ID:12 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T09:10:00.000Z'), 2, 'like',  12, '投稿ID:12 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T09:15:00.000Z'), 8, 'like',   7, '投稿ID:7 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T10:00:00.000Z'), 1, 'post',   9, '投稿ID:9 作成... 修正: 投稿ID:9は前日のため別途対応');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T10:05:00.000Z'), 3, 'follow', 5, 'ユーザーID:5 をフォロー');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T10:10:00.000Z'), 6, 'logout', 0, 'セッション終了');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T11:00:00.000Z'), 4, 'logout', 0, 'セッション終了');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T12:00:00.000Z'), 2, 'logout', 0, 'セッション終了');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-14T13:00:00.000Z'), 5, 'logout', 0, 'セッション終了');

-- ------------------------------------------------------------
-- 時間別統計（時系列 / 12件：1/14 06:00〜17:00）
-- ------------------------------------------------------------
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T06:00:00.000Z'),  245,  890, 2, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T07:00:00.000Z'),  247,  895, 4, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T08:00:00.000Z'),  248,  902, 6, 2);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T09:00:00.000Z'),  248,  910, 8, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T10:00:00.000Z'),  249,  913, 6, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T11:00:00.000Z'),  250,  918, 5, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T12:00:00.000Z'),  252,  928, 7, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T13:00:00.000Z'),  255,  945, 9, 3);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T14:00:00.000Z'),  258,  960, 8, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T15:00:00.000Z'),  260,  975, 6, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T16:00:00.000Z'),  261,  980, 5, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T17:00:00.000Z'),  263,  992, 4, 0);

-- ============================================================
-- 追加サンプルデータ
-- ============================================================

-- ------------------------------------------------------------
-- ユーザー追加（4名）
-- パターン：新規・超人気・公式・見る専（following多/follower少）
-- ------------------------------------------------------------
INSERT INTO sns_users VALUES ( 9, 'new_user_taro',    'たろう',          '',                                     0,    0, TIMESTAMP('2024-01-13T20:00:00.000Z'));
INSERT INTO sns_users VALUES (10, 'tech_influencer',  'TechKing',        'テック系インフルエンサー💻 フォロバ100%', 52000,  500, TIMESTAMP('2022-01-01T00:00:00.000Z'));
INSERT INTO sns_users VALUES (11, 'official_gridcorp','GridCorp公式',    '公式アカウント📢 製品情報・イベント告知',  8900,   30, TIMESTAMP('2022-06-01T00:00:00.000Z'));
INSERT INTO sns_users VALUES (12, 'silent_watcher',   'Mike',            '見る専💻',                               120,  890, TIMESTAMP('2023-01-15T12:00:00.000Z'));

-- ------------------------------------------------------------
-- 投稿追加（8件）
-- パターン：初投稿・バズ・公式告知・いいね0・深夜・旅行続き・コラボ・配信告知
-- ------------------------------------------------------------
INSERT INTO sns_posts VALUES (13,  9, 'はじめまして！たろうといいます。よろしくお願いします🙏 #はじめまして',                                                      1,   0,   0, TIMESTAMP('2024-01-13T20:10:00.000Z'));
INSERT INTO sns_posts VALUES (14, 10, '2024年必須のWebスタック🔥 React+TypeScript+Next.js+GridDBの組み合わせが最強な理由を解説。 #技術 #エンジニア #Web開発', 2341, 450, 189, TIMESTAMP('2024-01-14T09:00:00.000Z'));
INSERT INTO sns_posts VALUES (15, 11, '【お知らせ】GridDB v6.0リリースノート公開。パフォーマンスが従来比2倍に向上。 #GridDB #お知らせ',                            234,  89,  45, TIMESTAMP('2024-01-13T10:00:00.000Z'));
INSERT INTO sns_posts VALUES (16,  1, 'バグと格闘すること5時間...ようやく原因がわかった。型の不一致だった😇',                                                         0,   0,   0, TIMESTAMP('2024-01-14T03:00:00.000Z'));
INSERT INTO sns_posts VALUES (17,  2, '夕焼けの東京タワー📸 偶然通りかかって慌てて撮影しました。 #写真 #東京 #夕焼け',                                               98,  12,   5, TIMESTAMP('2024-01-15T18:30:00.000Z'));
INSERT INTO sns_posts VALUES (18,  5, 'タイ最終日。バンコクのカオサン通りで最後の夜を過ごしました🌙 また来ます！ #旅行 #タイ #バックパック',                          167,  22,  11, TIMESTAMP('2024-01-16T08:00:00.000Z'));
INSERT INTO sns_posts VALUES (19,  7, '@carol_musicさんの新曲イメージイラストを描きました🎨🎵 コラボありがとう！ #イラスト #コラボ #音楽',                            520,  71,  38, TIMESTAMP('2024-01-15T14:00:00.000Z'));
INSERT INTO sns_posts VALUES (20,  6, '今夜20時から新作タイトルを初見プレイします🎮 一緒に楽しみましょう！ #ゲーム #配信 #ゲーム実況',                               43,   6,   3, TIMESTAMP('2024-01-15T10:00:00.000Z'));

-- ------------------------------------------------------------
-- フォロー追加（12件）
-- パターン：新規ユーザーが有名人をフォロー・見る専の大量フォロー・インフルエンサーへの殺到
-- ------------------------------------------------------------
INSERT INTO sns_follows VALUES (17,  9,  1, TIMESTAMP('2024-01-13T20:05:00.000Z'));
INSERT INTO sns_follows VALUES (18,  9,  5, TIMESTAMP('2024-01-13T20:06:00.000Z'));
INSERT INTO sns_follows VALUES (19,  9,  7, TIMESTAMP('2024-01-13T20:07:00.000Z'));
INSERT INTO sns_follows VALUES (20, 12, 10, TIMESTAMP('2023-05-01T10:00:00.000Z'));
INSERT INTO sns_follows VALUES (21, 12,  1, TIMESTAMP('2023-05-02T10:00:00.000Z'));
INSERT INTO sns_follows VALUES (22, 12,  2, TIMESTAMP('2023-05-03T10:00:00.000Z'));
INSERT INTO sns_follows VALUES (23, 12,  7, TIMESTAMP('2023-05-04T10:00:00.000Z'));
INSERT INTO sns_follows VALUES (24,  1, 10, TIMESTAMP('2024-01-13T09:00:00.000Z'));
INSERT INTO sns_follows VALUES (25,  3, 10, TIMESTAMP('2024-01-13T09:30:00.000Z'));
INSERT INTO sns_follows VALUES (26,  6, 10, TIMESTAMP('2024-01-13T10:00:00.000Z'));
INSERT INTO sns_follows VALUES (27,  2, 11, TIMESTAMP('2024-01-12T08:00:00.000Z'));
INSERT INTO sns_follows VALUES (28,  1, 11, TIMESTAMP('2024-01-12T08:30:00.000Z'));

-- ------------------------------------------------------------
-- いいね追加（18件）
-- パターン：バズ投稿への集中・公式投稿・初投稿への1いいね・コラボ投稿
-- ------------------------------------------------------------
INSERT INTO sns_likes VALUES (21, 1, 14, TIMESTAMP('2024-01-14T09:05:00.000Z'));
INSERT INTO sns_likes VALUES (22, 2, 14, TIMESTAMP('2024-01-14T09:10:00.000Z'));
INSERT INTO sns_likes VALUES (23, 3, 14, TIMESTAMP('2024-01-14T09:15:00.000Z'));
INSERT INTO sns_likes VALUES (24, 4, 14, TIMESTAMP('2024-01-14T09:20:00.000Z'));
INSERT INTO sns_likes VALUES (25, 5, 14, TIMESTAMP('2024-01-14T09:25:00.000Z'));
INSERT INTO sns_likes VALUES (26, 6, 14, TIMESTAMP('2024-01-14T09:30:00.000Z'));
INSERT INTO sns_likes VALUES (27, 7, 14, TIMESTAMP('2024-01-14T09:35:00.000Z'));
INSERT INTO sns_likes VALUES (28, 8, 14, TIMESTAMP('2024-01-14T09:40:00.000Z'));
INSERT INTO sns_likes VALUES (29, 1, 15, TIMESTAMP('2024-01-13T10:05:00.000Z'));
INSERT INTO sns_likes VALUES (30, 2, 15, TIMESTAMP('2024-01-13T10:10:00.000Z'));
INSERT INTO sns_likes VALUES (31, 1, 13, TIMESTAMP('2024-01-13T20:15:00.000Z'));
INSERT INTO sns_likes VALUES (32, 1, 17, TIMESTAMP('2024-01-15T18:35:00.000Z'));
INSERT INTO sns_likes VALUES (33, 5, 17, TIMESTAMP('2024-01-15T18:40:00.000Z'));
INSERT INTO sns_likes VALUES (34, 7, 17, TIMESTAMP('2024-01-15T18:45:00.000Z'));
INSERT INTO sns_likes VALUES (35, 3, 19, TIMESTAMP('2024-01-15T14:05:00.000Z'));
INSERT INTO sns_likes VALUES (36, 1, 19, TIMESTAMP('2024-01-15T14:10:00.000Z'));
INSERT INTO sns_likes VALUES (37, 4, 19, TIMESTAMP('2024-01-15T14:15:00.000Z'));
INSERT INTO sns_likes VALUES (38, 2, 19, TIMESTAMP('2024-01-15T14:20:00.000Z'));

-- ------------------------------------------------------------
-- ハッシュタグ追加（14件）
-- パターン：人気タグの重複使用（タイ・写真・イラスト・技術・エンジニア）
-- ------------------------------------------------------------
INSERT INTO sns_hashtags VALUES (19, 13, 'はじめまして');
INSERT INTO sns_hashtags VALUES (20, 14, '技術');
INSERT INTO sns_hashtags VALUES (21, 14, 'エンジニア');
INSERT INTO sns_hashtags VALUES (22, 14, 'Web開発');
INSERT INTO sns_hashtags VALUES (23, 15, 'GridDB');
INSERT INTO sns_hashtags VALUES (24, 15, 'お知らせ');
INSERT INTO sns_hashtags VALUES (25, 17, '写真');
INSERT INTO sns_hashtags VALUES (26, 17, '東京');
INSERT INTO sns_hashtags VALUES (27, 18, '旅行');
INSERT INTO sns_hashtags VALUES (28, 18, 'タイ');
INSERT INTO sns_hashtags VALUES (29, 19, 'イラスト');
INSERT INTO sns_hashtags VALUES (30, 19, 'コラボ');
INSERT INTO sns_hashtags VALUES (31, 19, '音楽');
INSERT INTO sns_hashtags VALUES (32, 20, 'ゲーム');

-- ------------------------------------------------------------
-- アクティビティログ追加（時系列 / 2日分）
-- パターン：repostアクション・翌日の活動・複数日にまたがる時系列
-- ------------------------------------------------------------

-- 2024-01-15
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T07:00:00.000Z'),  2, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T07:10:00.000Z'),  7, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T07:15:00.000Z'),  2, 'like',   11, '投稿ID:11 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T07:20:00.000Z'),  7, 'post',   19, '投稿ID:19 作成');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T08:00:00.000Z'),  3, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T08:05:00.000Z'),  3, 'like',   19, '投稿ID:19 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T08:10:00.000Z'),  3, 'repost',  7, '投稿ID:7 をリポスト');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T09:00:00.000Z'),  1, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T09:05:00.000Z'),  6, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T09:10:00.000Z'),  6, 'post',   20, '投稿ID:20 作成');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T09:15:00.000Z'),  1, 'like',   19, '投稿ID:19 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T10:00:00.000Z'),  5, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T10:10:00.000Z'),  5, 'repost', 19, '投稿ID:19 をリポスト');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T10:20:00.000Z'),  4, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T10:30:00.000Z'),  4, 'like',   19, '投稿ID:19 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T14:05:00.000Z'),  2, 'post',   17, '投稿ID:17 作成');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T18:00:00.000Z'),  8, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T18:10:00.000Z'),  8, 'like',   17, '投稿ID:17 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T20:00:00.000Z'),  7, 'logout',  0, 'セッション終了');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-15T22:00:00.000Z'),  1, 'logout',  0, 'セッション終了');

-- 2024-01-16
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T06:30:00.000Z'),  5, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T06:35:00.000Z'),  5, 'post',   18, '投稿ID:18 作成');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T06:40:00.000Z'),  5, 'logout',  0, 'セッション終了');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T09:00:00.000Z'),  1, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T09:05:00.000Z'),  1, 'like',   18, '投稿ID:18 にいいね');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T09:10:00.000Z'),  2, 'login',   0, 'セッション開始');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T09:15:00.000Z'),  2, 'repost', 18, '投稿ID:18 をリポスト');
INSERT INTO sns_activity_log VALUES (TIMESTAMP('2024-01-16T20:00:00.000Z'),  1, 'logout',  0, 'セッション終了');

-- ------------------------------------------------------------
-- 時間別統計追加
-- パターン：深夜〜早朝のゼロ活動・翌日の統計継続・増加傾向
-- ------------------------------------------------------------

-- 2024-01-14 夜（18:00〜23:00）
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T18:00:00.000Z'),  265, 1010,  8, 2);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T19:00:00.000Z'),  268, 1025, 10, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T20:00:00.000Z'),  270, 1035, 12, 3);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T21:00:00.000Z'),  272, 1050,  9, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T22:00:00.000Z'),  274, 1060,  7, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-14T23:00:00.000Z'),  275, 1065,  4, 0);

-- 2024-01-15 深夜〜早朝（00:00〜05:00 / アクティブユーザーが0〜1）
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T00:00:00.000Z'),  275, 1066,  1, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T01:00:00.000Z'),  275, 1066,  0, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T02:00:00.000Z'),  275, 1066,  0, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T03:00:00.000Z'),  275, 1067,  1, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T04:00:00.000Z'),  275, 1067,  0, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T05:00:00.000Z'),  275, 1067,  0, 0);

-- 2024-01-15 朝〜夕（06:00〜17:00）
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T06:00:00.000Z'),  275, 1068,  2, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T07:00:00.000Z'),  276, 1072,  4, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T08:00:00.000Z'),  277, 1080,  5, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T09:00:00.000Z'),  279, 1092,  7, 2);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T10:00:00.000Z'),  280, 1100,  8, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T11:00:00.000Z'),  281, 1108,  6, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T12:00:00.000Z'),  283, 1120,  9, 2);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T13:00:00.000Z'),  285, 1135, 11, 3);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T14:00:00.000Z'),  287, 1150,  8, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T15:00:00.000Z'),  288, 1162,  6, 0);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T16:00:00.000Z'),  289, 1170,  5, 1);
INSERT INTO sns_hourly_stats VALUES (TIMESTAMP('2024-01-15T17:00:00.000Z'),  290, 1178,  4, 0);
