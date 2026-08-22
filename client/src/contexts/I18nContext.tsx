import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Language = "ja" | "en" | "zh" | "ko";

type TranslationKey =
  | "common.loading"
  | "common.back"
  | "common.logout"
  | "common.login"
  | "common.open"
  | "common.save"
  | "common.cancel"
  | "common.confirm"
  | "common.language"
  | "home.tagline"
  | "home.description"
  | "home.loginHint"
  | "home.createFamily"
  | "home.noFamilies"
  | "home.noFamiliesHint"
  | "home.groupName"
  | "home.groupPlaceholder"
  | "home.creating"
  | "home.create"
  | "home.createdAt"
  | "home.createGroup"
  | "family.members"
  | "family.invite"
  | "family.timeline"
  | "family.safety"
  | "family.ai"
  | "family.stats"
  | "family.notifications"
  | "family.assistant"
  | "family.searchTimeline"
  | "family.scheduleProposal"
  | "family.voiceInput"
  | "family.markAllRead"
  | "family.noNotifications"
  | "family.confirmSchedule"
  | "family.scheduleAdded"
  | "family.notificationSettings"
  | "family.vibration"
  | "family.sound"
  | "family.banner"
  | "family.quietMode"
  | "family.mood"
  | "family.photo"
  | "family.music"
  | "family.location"
  | "family.shareFeeling"
  | "family.moodSituation"
  | "family.moodPlaceholder"
  | "family.posting"
  | "family.post"
  | "family.membersTitle"
  | "family.timelineTitle"
  | "family.loadingTimeline"
  | "family.roleGuardian"
  | "family.roleChild"
  | "family.roleElderly"
  | "family.noTimeline"
  | "family.noTimelineHint"
  | "family.aiProposal"
  | "family.message"
  | "family.activity"
  | "family.groupNotFound"
  | "family.unread"
  | "family.voiceUnavailable"
  | "family.stopRecording"
  | "family.events"
  | "family.noEvents"
  | "family.edit"
  | "family.delete"
  | "family.reschedule"
  | "family.bannerDisabled"
  | "family.guardianNotificationHint"
  | "family.childNotificationHint"
  | "family.elderlyNotificationHint"
  | "family.unknownUser"
  | "family.timelineAlt"
  | "family.aiLabel"
  | "family.eventTitle"
  | "family.eventDescription"
  | "family.eventStart"
  | "family.eventEnd"
  | "family.eventLocation"
  | "family.applyChange"
  | "family.trailHeatmap"
  | "family.trailHeatmapHint"
  | "family.trailRange"
  | "family.trailDays"
  | "family.trailMember"
  | "family.allMembers"
  | "family.trailPointCount"
  | "family.trailPrivacy"
  | "family.voiceCommandExamples"
  | "family.voiceCommandSchedule"
  | "family.voiceCommandPhotos"
  | "family.voiceCommandTasks"
  | "family.voiceCommandProcessing"
  | "family.voiceCommandResult"
  | "family.voiceCommandRetry"
  | "family.voiceCommandStart"
  | "family.celebration"
  | "family.celebrationPlaceholder"
  | "family.celebrationSend"
  | "family.celebrationBadge"
  | "family.celebrationEmpty"
  | "family.celebrationSuccess"
  | "family.trailTimeSlot"
  | "family.timeSlotAll"
  | "family.timeSlotDaytime"
  | "family.timeSlotNight"
  | "family.ttsReadAloud"
  | "family.digestAlbum"
  | "family.digestBadge"
  | "family.selectMonth"
  | "family.digestEmpty"
  | "family.album"
  | "family.weeklyAi"
  | "family.healthExperience"
  | "family.switchFeatures"
  | "family.returnTimeline"
  | "family.shareFeature"
  | "family.currentFeature"
  | "family.preparingFeature"
  | "family.shareOpened"
  | "family.shareCopied"
  | "family.shareUnavailable"
  | "family.shareText"
  | "family.tabKeyboardHelp"
  | "family.sharedCardOpened"
  | "family.motionReducedNavigation"
  | "family.showingNow"
  | "family.openFeature"
  | "family.focusCurrentFeature"
  | "family.tabHelp"
  | "family.tabHelpClose"
  | "family.tabHelpText"
  | "family.jumpFirstFeature"
  | "family.jumpLastFeature"
  | "family.centerCurrentFeature"
  | "family.currentFeatureCentered"
  | "family.currentFeaturePosition"
  | "family.skipToCurrentContent";

export const supportedLanguages: Language[] = ["ja", "en", "zh", "ko"];

export const messages: Record<Language, Record<TranslationKey, string>> = {
  ja: {
    "common.loading": "読み込み中...",
    "common.back": "戻る",
    "common.logout": "ログアウト",
    "common.login": "ログインして始める",
    "common.open": "開く",
    "common.save": "保存",
    "common.cancel": "キャンセル",
    "common.confirm": "確認",
    "common.language": "言語",
    "home.tagline": "家族を繋ぐ、絆の同期アプリ",
    "home.description": "家族全員が日常の小さな行動や気持ちをリアルタイムで共有・見守り合えるアプリです。",
    "home.loginHint": "Manus OAuthで安全にログインできます",
    "home.createFamily": "新しい家族グループを作成",
    "home.noFamilies": "まだ家族グループがありません",
    "home.noFamiliesHint": "新しい家族グループを作成して、家族との繋がりを始めましょう。",
    "home.groupName": "グループ名",
    "home.groupPlaceholder": "例：田中家",
    "home.creating": "作成中...",
    "home.create": "作成",
    "home.createdAt": "に作成",
    "home.createGroup": "グループを作成",
    "family.members": "人のメンバー",
    "family.invite": "メンバーを招待",
    "family.timeline": "タイムライン",
    "family.safety": "見守り",
    "family.ai": "AI提案",
    "family.stats": "統計",
    "family.notifications": "お知らせ",
    "family.assistant": "家族AIアシスタント",
    "family.searchTimeline": "タイムラインを検索",
    "family.scheduleProposal": "予定を提案",
    "family.voiceInput": "音声入力",
    "family.markAllRead": "すべて既読",
    "family.noNotifications": "新しいお知らせはありません",
    "family.confirmSchedule": "この予定を追加しますか？",
    "family.scheduleAdded": "予定を追加しました",
    "family.notificationSettings": "通知設定",
    "family.vibration": "バイブレーション",
    "family.sound": "控えめな音",
    "family.banner": "画面表示",
    "family.quietMode": "静かな通知モード",
    "family.mood": "気持ち",
    "family.photo": "写真",
    "family.music": "音楽",
    "family.location": "位置情報",
    "family.trailHeatmap": "家族の足あと",
    "family.trailHeatmapHint": "過去の位置情報を、家族の思い出として静かに振り返ります。",
    "family.trailRange": "表示期間",
    "family.trailDays": "過去{days}日",
    "family.trailMember": "メンバー",
    "family.allMembers": "家族全員",
    "family.trailPointCount": "{count}地点",
    "family.trailPrivacy": "位置情報は家族グループ内だけで表示されます。",
    "family.trailTimeSlot": "時間帯",
    "family.timeSlotAll": "全時間帯",
    "family.timeSlotDaytime": "日中 (6:00-18:00)",
    "family.timeSlotNight": "夜間 (18:00-6:00)",
    "family.voiceCommandExamples": "例：「今日の予定を教えて」「公園の写真を探して」",
    "family.voiceCommandSchedule": "今日の予定を教えて",
    "family.voiceCommandPhotos": "公園の写真を探して",
    "family.voiceCommandTasks": "家族のタスクを確認して",
    "family.voiceCommandProcessing": "音声を確認しています…",
    "family.voiceCommandResult": "音声コマンドの結果",
    "family.voiceCommandRetry": "もう一度話す",
    "family.voiceCommandStart": "音声コマンドを開始",
    "family.celebration": "お祝いメッセージ",
    "family.celebrationPlaceholder": "家族に伝えたいお祝いを入力…",
    "family.celebrationSend": "お祝いを送る",
    "family.celebrationBadge": "お祝いスタンプ",
    "family.celebrationEmpty": "今日のお祝いはまだありません。",
    "family.celebrationSuccess": "お祝いスタンプを家族に届けました。",
    "family.digestAlbum": "お祝いダイジェストアルバム",
    "family.digestBadge": "月別アーカイブ",
    "family.selectMonth": "表示月を選択",
    "family.digestEmpty": "選択した月のお祝いメッセージはまだありません。",
    "family.shareFeeling": "今の気持ちをシェア",
    "family.moodSituation": "気持ち・状況",
    "family.moodPlaceholder": "例：今日は楽しかった！",
    "family.posting": "投稿中...",
    "family.post": "投稿",
    "family.membersTitle": "家族メンバー",
    "family.timelineTitle": "家族タイムライン",
    "family.loadingTimeline": "読み込み中...",
    "family.roleGuardian": "保護者",
    "family.roleChild": "子供",
    "family.roleElderly": "高齢者",
    "family.noTimeline": "まだタイムラインはありません",
    "family.noTimelineHint": "家族の小さな出来事を最初にシェアしてみましょう。",
    "family.aiProposal": "AI提案",
    "family.message": "メッセージ",
    "family.activity": "アクティビティ",
    "family.groupNotFound": "グループが見つかりません",
    "family.unread": "未読",
    "family.voiceUnavailable": "このブラウザでは音声入力を利用できません",
    "family.stopRecording": "録音を停止",
    "family.events": "家族の予定",
    "family.noEvents": "予定はありません",
    "family.edit": "編集",
    "family.delete": "削除",
    "family.reschedule": "再調整",
    "family.bannerDisabled": "画面通知はオフです。履歴は非表示になっています。",
    "family.guardianNotificationHint": "保護者向け：必要なときだけ音をオンにできます。",
    "family.childNotificationHint": "子供向け：音を使わない静かな通知で見守ります。",
    "family.elderlyNotificationHint": "高齢者向け：初期設定で控えめな音と振動を使います。",
    "family.unknownUser": "家族",
    "family.timelineAlt": "タイムラインの画像",
    "family.aiLabel": "AI",
    "family.eventTitle": "予定名",
    "family.eventDescription": "説明",
    "family.eventStart": "開始",
    "family.eventEnd": "終了",
    "family.eventLocation": "場所",
    "family.applyChange": "変更を反映",
    "family.ttsReadAloud": "AI音声を読み上げる",
    "family.album": "家族アルバム",
    "family.weeklyAi": "週次AI",
    "family.healthExperience": "ヘルス体験",
    "family.switchFeatures": "家族の機能を切り替える",
    "family.returnTimeline": "タイムラインへ戻る",
    "family.shareFeature": "この機能を共有",
    "family.currentFeature": "現在、家族の「{tab}」を表示しています。",
    "family.preparingFeature": "「{tab}」を準備しています…",
    "family.shareOpened": "共有画面を開きました。",
    "family.shareCopied": "この機能へのリンクをコピーしました。",
    "family.shareUnavailable": "この端末では共有できませんでした。URLをコピーして家族へ送ってください。",
    "family.shareText": "KizunaSyncの「{tab}」を開きます。",
    "family.tabKeyboardHelp": "左右の矢印キーで前後の機能へ移動します。Homeキーで最初、Endキーで最後の機能を開きます。",
    "family.sharedCardOpened": "共有された家族カードを開きました。",
    "family.motionReducedNavigation": "端末の設定に合わせて、画面の移動アニメーションを抑えています。",
    "family.showingNow": "表示中",
    "family.openFeature": "機能を開く",
    "family.focusCurrentFeature": "表示中の機能へ移動",
    "family.tabHelp": "タブ操作ヘルプ",
    "family.tabHelpClose": "ヘルプを閉じる",
    "family.tabHelpText": "横並びのタブです。Alt+Tで表示中の機能タブへ移動できます。左右矢印で前後、Home/Endで先頭・末尾へ移動し、Escで表示中の内容へ戻ります。",
    "family.jumpFirstFeature": "最初の機能へ",
    "family.jumpLastFeature": "最後の機能へ",
    "family.centerCurrentFeature": "表示中タブを中央へ",
    "family.currentFeatureCentered": "表示中の機能タブを見える位置へ戻しました。",
    "family.currentFeaturePosition": "全{total}件中 {current}番目",
    "family.skipToCurrentContent": "表示中の内容へ",
  },
  en: {
    "common.loading": "Loading...",
    "common.back": "Back",
    "common.logout": "Log out",
    "common.login": "Log in to begin",
    "common.open": "Open",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.language": "Language",
    "home.tagline": "A gentle sync for family connection",
    "home.description": "Share small moments in real time and quietly look out for one another.",
    "home.loginHint": "Secure sign-in with Manus OAuth",
    "home.createFamily": "Create a family group",
    "home.noFamilies": "No family groups yet",
    "home.noFamiliesHint": "Create a family group and start staying connected.",
    "home.groupName": "Group name",
    "home.groupPlaceholder": "e.g. Tanaka family",
    "home.creating": "Creating...",
    "home.create": "Create",
    "home.createdAt": " created",
    "home.createGroup": "Create a group",
    "family.members": " members",
    "family.invite": "Invite members",
    "family.timeline": "Timeline",
    "family.safety": "Safety",
    "family.ai": "AI ideas",
    "family.stats": "Stats",
    "family.notifications": "Notifications",
    "family.assistant": "Family AI assistant",
    "family.searchTimeline": "Search the timeline",
    "family.scheduleProposal": "Suggest a schedule",
    "family.voiceInput": "Voice input",
    "family.markAllRead": "Mark all read",
    "family.noNotifications": "No new notifications",
    "family.confirmSchedule": "Add this event to the family calendar?",
    "family.scheduleAdded": "Event added",
    "family.notificationSettings": "Notification settings",
    "family.vibration": "Vibration",
    "family.sound": "Soft sound",
    "family.banner": "On-screen banner",
    "family.quietMode": "Quiet notification mode",
    "family.mood": "Mood",
    "family.photo": "Photo",
    "family.music": "Music",
    "family.location": "Location",
    "family.trailHeatmap": "Family trail",
    "family.trailHeatmapHint": "Quietly revisit recent places as shared family memories.",
    "family.trailRange": "Time range",
    "family.trailDays": "Last {days} days",
    "family.trailMember": "Member",
    "family.allMembers": "Everyone",
    "family.trailPointCount": "{count} locations",
    "family.trailPrivacy": "Location data is visible only inside this family group.",
    "family.trailTimeSlot": "Time Slot",
    "family.timeSlotAll": "All Hours",
    "family.timeSlotDaytime": "Daytime (6:00-18:00)",
    "family.timeSlotNight": "Night (18:00-6:00)",
    "family.voiceCommandExamples": "Try: “Tell me today’s schedule” or “Find park photos”.",
    "family.voiceCommandSchedule": "Tell me today’s schedule",
    "family.voiceCommandPhotos": "Find photos from the park",
    "family.voiceCommandTasks": "Check the family tasks",
    "family.voiceCommandProcessing": "Checking your voice…",
    "family.voiceCommandResult": "Voice command result",
    "family.voiceCommandRetry": "Speak again",
    "family.voiceCommandStart": "Start voice command",
    "family.celebration": "Celebration message",
    "family.celebrationPlaceholder": "Write a celebration for your family…",
    "family.celebrationSend": "Send celebration",
    "family.celebrationBadge": "Celebration sticker",
    "family.celebrationEmpty": "No celebrations yet today.",
    "family.celebrationSuccess": "Your celebration sticker was shared with the family.",
    "family.digestAlbum": "Celebration Digest Album",
    "family.digestBadge": "Monthly Archive",
    "family.selectMonth": "Select month",
    "family.digestEmpty": "No celebration messages found for this month.",
    "family.shareFeeling": "Share how you feel",
    "family.moodSituation": "Mood or situation",
    "family.moodPlaceholder": "e.g. I had a wonderful day!",
    "family.posting": "Posting...",
    "family.post": "Post",
    "family.membersTitle": "Family members",
    "family.timelineTitle": "Family timeline",
    "family.loadingTimeline": "Loading timeline...",
    "family.roleGuardian": "Guardian",
    "family.roleChild": "Child",
    "family.roleElderly": "Elder",
    "family.noTimeline": "No timeline entries yet",
    "family.noTimelineHint": "Share the first small moment with your family.",
    "family.aiProposal": "AI ideas",
    "family.message": "Message",
    "family.activity": "Activity",
    "family.groupNotFound": "Family group not found",
    "family.unread": "Unread",
    "family.voiceUnavailable": "Voice input is not available in this browser",
    "family.stopRecording": "Stop recording",
    "family.events": "Family events",
    "family.noEvents": "No events yet",
    "family.edit": "Edit",
    "family.delete": "Delete",
    "family.reschedule": "Reschedule",
    "family.bannerDisabled": "On-screen notifications are off. History is hidden.",
    "family.guardianNotificationHint": "For guardians: sound can be enabled only when needed.",
    "family.childNotificationHint": "For children: quiet notifications avoid unnecessary sound.",
    "family.elderlyNotificationHint": "For elders: gentle sound and vibration are enabled by default.",
    "family.unknownUser": "Family member",
    "family.timelineAlt": "Timeline image",
    "family.aiLabel": "AI",
    "family.eventTitle": "Event title",
    "family.eventDescription": "Description",
    "family.eventStart": "Start",
    "family.eventEnd": "End",
    "family.eventLocation": "Location",
    "family.applyChange": "Apply changes",
    "family.ttsReadAloud": "Read AI aloud",
    "family.album": "Family album",
    "family.weeklyAi": "Weekly AI",
    "family.healthExperience": "Health experience",
    "family.switchFeatures": "Switch family features",
    "family.returnTimeline": "Return to timeline",
    "family.shareFeature": "Share this feature",
    "family.currentFeature": "Now showing the family’s “{tab}”.",
    "family.preparingFeature": "Preparing “{tab}”…",
    "family.shareOpened": "The sharing panel is open.",
    "family.shareCopied": "The link to this feature was copied.",
    "family.shareUnavailable": "Sharing is unavailable on this device. Please copy the URL and send it to your family.",
    "family.shareText": "Open KizunaSync’s “{tab}”.",
    "family.tabKeyboardHelp": "Use the left and right arrow keys to move between features. Press Home for the first feature or End for the last one.",
    "family.sharedCardOpened": "Opened the shared family card.",
    "family.motionReducedNavigation": "Screen movement animations are reduced to match your device setting.",
    "family.showingNow": "Showing",
    "family.openFeature": "Open feature",
    "family.focusCurrentFeature": "Focus current feature",
    "family.tabHelp": "Tab controls help",
    "family.tabHelpClose": "Close help",
    "family.tabHelpText": "These tabs are arranged horizontally. Press Alt+T to focus the current feature tab. Use left/right arrows for adjacent features, Home/End for the first or last feature, and Esc to return to the current content.",
    "family.jumpFirstFeature": "First feature",
    "family.jumpLastFeature": "Last feature",
    "family.centerCurrentFeature": "Center current tab",
    "family.currentFeatureCentered": "Moved the current feature tab back into view.",
    "family.currentFeaturePosition": "{current} of {total}",
    "family.skipToCurrentContent": "Skip to current content",
  },
  zh: {
    "common.loading": "加载中...",
    "common.back": "返回",
    "common.logout": "退出登录",
    "common.login": "登录开始使用",
    "common.open": "打开",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.language": "语言",
    "home.tagline": "连接家人，同步温暖时刻",
    "home.description": "实时分享日常的小事和心情，安静地守护彼此。",
    "home.loginHint": "使用 Manus OAuth 安全登录",
    "home.createFamily": "创建家庭群组",
    "home.noFamilies": "还没有家庭群组",
    "home.noFamiliesHint": "创建家庭群组，开始与家人保持连接。",
    "home.groupName": "群组名称",
    "home.groupPlaceholder": "例如：田中家",
    "home.creating": "创建中...",
    "home.create": "创建",
    "home.createdAt": "创建于",
    "home.createGroup": "创建群组",
    "family.members": " 位成员",
    "family.invite": "邀请成员",
    "family.timeline": "时间线",
    "family.safety": "守护",
    "family.ai": "AI建议",
    "family.stats": "统计",
    "family.notifications": "通知",
    "family.assistant": "家庭AI助手",
    "family.searchTimeline": "搜索时间线",
    "family.scheduleProposal": "建议日程",
    "family.voiceInput": "语音输入",
    "family.markAllRead": "全部标为已读",
    "family.noNotifications": "没有新通知",
    "family.confirmSchedule": "要把这个安排加入家庭日历吗？",
    "family.scheduleAdded": "已添加日程",
    "family.notificationSettings": "通知设置",
    "family.vibration": "振动",
    "family.sound": "轻柔声音",
    "family.banner": "屏幕提示",
    "family.quietMode": "静默通知模式",
    "family.mood": "心情",
    "family.photo": "照片",
    "family.music": "音乐",
    "family.location": "位置",
    "family.trailHeatmap": "家庭足迹",
    "family.trailHeatmapHint": "安静地回顾近期地点，把它们留作家庭记忆。",
    "family.trailRange": "显示范围",
    "family.trailDays": "过去{days}天",
    "family.trailMember": "成员",
    "family.allMembers": "全家",
    "family.trailPointCount": "{count}个地点",
    "family.trailPrivacy": "位置数据仅在家庭群组内显示。",
    "family.voiceCommandExamples": "试试：“告诉我今天的日程”或“寻找公园照片”。",
    "family.voiceCommandSchedule": "告诉我今天的日程",
    "family.voiceCommandPhotos": "寻找公园照片",
    "family.voiceCommandTasks": "查看家庭任务",
    "family.voiceCommandProcessing": "正在确认语音…",
    "family.voiceCommandResult": "语音指令结果",
    "family.voiceCommandRetry": "再说一次",
    "family.voiceCommandStart": "开始语音指令",
    "family.celebration": "祝福消息",
    "family.celebrationPlaceholder": "写下想送给家人的祝福…",
    "family.celebrationSend": "发送祝福",
    "family.celebrationBadge": "祝福贴纸",
    "family.celebrationEmpty": "今天还没有祝福。",
    "family.celebrationSuccess": "祝福贴纸已送达家人。",
    "family.digestAlbum": "祝福文摘相册",
    "family.digestBadge": "月度归档",
    "family.selectMonth": "选择月份",
    "family.digestEmpty": "所选月份暂无祝福消息。",
    "family.shareFeeling": "分享现在的心情",
    "family.moodSituation": "心情或状态",
    "family.moodPlaceholder": "例如：今天过得很开心！",
    "family.posting": "发布中...",
    "family.post": "发布",
    "family.membersTitle": "家庭成员",
    "family.timelineTitle": "家庭时间线",
    "family.loadingTimeline": "正在加载时间线...",
    "family.roleGuardian": "家长",
    "family.roleChild": "孩子",
    "family.roleElderly": "长辈",
    "family.noTimeline": "还没有时间线记录",
    "family.noTimelineHint": "分享第一个家庭小瞬间吧。",
    "family.aiProposal": "AI建议",
    "family.message": "消息",
    "family.activity": "活动",
    "family.groupNotFound": "找不到家庭群组",
    "family.unread": "未读",
    "family.voiceUnavailable": "此浏览器不支持语音输入",
    "family.stopRecording": "停止录音",
    "family.events": "家庭日程",
    "family.noEvents": "暂无日程",
    "family.edit": "编辑",
    "family.delete": "删除",
    "family.reschedule": "重新安排",
    "family.bannerDisabled": "屏幕通知已关闭，历史记录已隐藏。",
    "family.guardianNotificationHint": "家长：可按需开启声音。",
    "family.childNotificationHint": "孩子：使用安静通知，避免不必要的声音。",
    "family.elderlyNotificationHint": "长辈：默认开启轻柔声音和振动。",
    "family.unknownUser": "家庭成员",
    "family.timelineAlt": "时间线图片",
    "family.aiLabel": "AI",
    "family.eventTitle": "日程名称",
    "family.eventDescription": "说明",
    "family.eventStart": "开始",
    "family.eventEnd": "结束",
    "family.eventLocation": "地点",
    "family.applyChange": "应用更改",
    "family.trailTimeSlot": "时间段",
    "family.timeSlotAll": "全部时间",
    "family.timeSlotDaytime": "白天 (6:00-18:00)",
    "family.timeSlotNight": "夜间 (18:00-6:00)",
    "family.ttsReadAloud": "朗读AI回复",
    "family.album": "家庭相册",
    "family.weeklyAi": "每周AI",
    "family.healthExperience": "健康体验",
    "family.switchFeatures": "切换家庭功能",
    "family.returnTimeline": "返回时间线",
    "family.shareFeature": "分享此功能",
    "family.currentFeature": "正在显示家庭的“{tab}”。",
    "family.preparingFeature": "正在准备“{tab}”…",
    "family.shareOpened": "已打开分享面板。",
    "family.shareCopied": "已复制此功能的链接。",
    "family.shareUnavailable": "此设备无法分享。请复制网址并发送给家人。",
    "family.shareText": "打开 KizunaSync 的“{tab}”。",
    "family.tabKeyboardHelp": "使用左右方向键切换功能。按 Home 键打开第一个功能，按 End 键打开最后一个功能。",
    "family.sharedCardOpened": "已打开共享的家庭卡片。",
    "family.motionReducedNavigation": "已根据设备设置减少页面移动动画。",
    "family.showingNow": "正在显示",
    "family.openFeature": "打开功能",
    "family.focusCurrentFeature": "定位到当前功能",
    "family.tabHelp": "标签操作帮助",
    "family.tabHelpClose": "关闭帮助",
    "family.tabHelpText": "这些标签水平排列。按 Alt+T 可定位到当前功能标签。使用左右方向键切换，Home/End 键跳到第一个或最后一个功能，Esc 键返回当前内容。",
    "family.jumpFirstFeature": "第一个功能",
    "family.jumpLastFeature": "最后一个功能",
    "family.centerCurrentFeature": "居中当前标签",
    "family.currentFeatureCentered": "已将当前功能标签移回可见位置。",
    "family.currentFeaturePosition": "共 {total} 个中的第 {current} 个",
    "family.skipToCurrentContent": "跳到当前内容",
  },
  ko: {
    "common.loading": "불러오는 중...",
    "common.back": "뒤로",
    "common.logout": "로그아웃",
    "common.login": "로그인하고 시작하기",
    "common.open": "열기",
    "common.save": "저장",
    "common.cancel": "취소",
    "common.confirm": "확인",
    "common.language": "언어",
    "home.tagline": "가족을 연결하고 따뜻한 순간을 동기화해요",
    "home.description": "일상의 작은 행동과 마음을 실시간으로 나누고 서로를 조용히 돌보는 앱입니다.",
    "home.loginHint": "Manus OAuth로 안전하게 로그인할 수 있습니다",
    "home.createFamily": "가족 그룹 만들기",
    "home.noFamilies": "아직 가족 그룹이 없습니다",
    "home.noFamiliesHint": "가족 그룹을 만들고 서로 연결을 시작해 보세요.",
    "home.groupName": "그룹 이름",
    "home.groupPlaceholder": "예: 다나카 가족",
    "home.creating": "만드는 중...",
    "home.create": "만들기",
    "home.createdAt": "에 생성",
    "home.createGroup": "그룹 만들기",
    "family.members": "명의 멤버",
    "family.invite": "멤버 초대",
    "family.timeline": "타임라인",
    "family.safety": "안전",
    "family.ai": "AI 제안",
    "family.stats": "통계",
    "family.notifications": "알림",
    "family.assistant": "가족 AI 도우미",
    "family.searchTimeline": "타임라인 검색",
    "family.scheduleProposal": "일정 제안",
    "family.voiceInput": "음성 입력",
    "family.markAllRead": "모두 읽음 처리",
    "family.noNotifications": "새 알림이 없습니다",
    "family.confirmSchedule": "이 일정을 가족 캘린더에 추가할까요?",
    "family.scheduleAdded": "일정이 추가되었습니다",
    "family.notificationSettings": "알림 설정",
    "family.vibration": "진동",
    "family.sound": "작은 소리",
    "family.banner": "화면 표시",
    "family.quietMode": "조용한 알림 모드",
    "family.mood": "기분",
    "family.photo": "사진",
    "family.music": "음악",
    "family.location": "위치",
    "family.trailHeatmap": "가족 발자국",
    "family.trailHeatmapHint": "최근 장소를 가족의 추억으로 조용히 돌아봅니다.",
    "family.trailRange": "기간",
    "family.trailDays": "최근 {days}일",
    "family.trailMember": "구성원",
    "family.allMembers": "가족 모두",
    "family.trailPointCount": "{count}곳",
    "family.trailPrivacy": "위치 데이터는 가족 그룹 안에서만 표시됩니다.",
    "family.voiceCommandExamples": "예: “오늘 일정을 알려줘” 또는 “공원 사진을 찾아줘”.",
    "family.voiceCommandSchedule": "오늘 일정을 알려줘",
    "family.voiceCommandPhotos": "공원 사진을 찾아줘",
    "family.voiceCommandTasks": "가족 할 일을 확인해줘",
    "family.voiceCommandProcessing": "음성을 확인하는 중…",
    "family.voiceCommandResult": "음성 명령 결과",
    "family.voiceCommandRetry": "다시 말하기",
    "family.voiceCommandStart": "음성 명령 시작",
    "family.celebration": "축하 메시지",
    "family.celebrationPlaceholder": "가족에게 전할 축하를 적어 보세요…",
    "family.celebrationSend": "축하 보내기",
    "family.celebrationBadge": "축하 스티커",
    "family.celebrationEmpty": "오늘은 아직 축하 메시지가 없습니다.",
    "family.celebrationSuccess": "축하 스티커를 가족에게 보냈습니다.",
    "family.digestAlbum": "축하 다이제스트 앨범",
    "family.digestBadge": "월간 아카이브",
    "family.selectMonth": "조회할 월 선택",
    "family.digestEmpty": "선택한 월에 축하 메시지가 없습니다.",
    "family.shareFeeling": "지금 기분 공유하기",
    "family.moodSituation": "기분 또는 상황",
    "family.moodPlaceholder": "예: 오늘 정말 즐거웠어요!",
    "family.posting": "게시 중...",
    "family.post": "게시",
    "family.membersTitle": "가족 구성원",
    "family.timelineTitle": "가족 타임라인",
    "family.loadingTimeline": "타임라인을 불러오는 중...",
    "family.roleGuardian": "보호자",
    "family.roleChild": "아이",
    "family.roleElderly": "어르신",
    "family.noTimeline": "아직 타임라인 기록이 없습니다",
    "family.noTimelineHint": "가족과 첫 번째 작은 순간을 공유해 보세요.",
    "family.aiProposal": "AI 제안",
    "family.message": "메시지",
    "family.activity": "활동",
    "family.groupNotFound": "가족 그룹을 찾을 수 없습니다",
    "family.unread": "읽지 않음",
    "family.voiceUnavailable": "이 브라우저에서는 음성 입력을 사용할 수 없습니다",
    "family.stopRecording": "녹음 중지",
    "family.events": "가족 일정",
    "family.noEvents": "일정이 없습니다",
    "family.edit": "편집",
    "family.delete": "삭제",
    "family.reschedule": "일정 다시 잡기",
    "family.bannerDisabled": "화면 알림이 꺼져 있어 기록이 숨겨져 있습니다.",
    "family.guardianNotificationHint": "보호자: 필요할 때만 소리를 켤 수 있습니다.",
    "family.childNotificationHint": "아이: 불필요한 소리를 줄이는 조용한 알림을 사용합니다.",
    "family.elderlyNotificationHint": "어르신: 작은 소리와 진동이 기본으로 켜져 있습니다.",
    "family.unknownUser": "가족 구성원",
    "family.timelineAlt": "타임라인 이미지",
    "family.aiLabel": "AI",
    "family.eventTitle": "일정 이름",
    "family.eventDescription": "설명",
    "family.eventStart": "시작",
    "family.eventEnd": "종료",
    "family.eventLocation": "장소",
    "family.applyChange": "변경 적용",
    "family.trailTimeSlot": "시간대",
    "family.timeSlotAll": "전체 시간",
    "family.timeSlotDaytime": "주간 (6:00-18:00)",
    "family.timeSlotNight": "야간 (18:00-6:00)",
    "family.ttsReadAloud": "AI 답변 읽어주기",
    "family.album": "가족 앨범",
    "family.weeklyAi": "주간 AI",
    "family.healthExperience": "건강 체험",
    "family.switchFeatures": "가족 기능 전환",
    "family.returnTimeline": "타임라인으로 돌아가기",
    "family.shareFeature": "이 기능 공유",
    "family.currentFeature": "현재 가족의 “{tab}”을 표시하고 있습니다.",
    "family.preparingFeature": "“{tab}”을 준비하고 있습니다…",
    "family.shareOpened": "공유 화면을 열었습니다.",
    "family.shareCopied": "이 기능의 링크를 복사했습니다.",
    "family.shareUnavailable": "이 기기에서는 공유할 수 없습니다. URL을 복사해 가족에게 보내 주세요.",
    "family.shareText": "KizunaSync의 “{tab}”을 엽니다.",
    "family.tabKeyboardHelp": "왼쪽 및 오른쪽 화살표 키로 기능 사이를 이동합니다. Home 키를 누르면 첫 기능으로, End 키를 누르면 마지막 기능으로 이동합니다.",
    "family.sharedCardOpened": "공유된 가족 카드를 열었습니다.",
    "family.motionReducedNavigation": "기기 설정에 맞춰 화면 이동 애니메이션을 줄였습니다.",
    "family.showingNow": "표시 중",
    "family.openFeature": "기능 열기",
    "family.focusCurrentFeature": "현재 기능으로 이동",
    "family.tabHelp": "탭 조작 도움말",
    "family.tabHelpClose": "도움말 닫기",
    "family.tabHelpText": "탭은 가로로 배치되어 있습니다. Alt+T를 누르면 현재 기능 탭으로 이동합니다. 좌우 화살표로 전후 기능으로 이동하고 Home/End로 처음 또는 마지막 기능으로 이동하며 Esc로 현재 내용으로 돌아갑니다.",
    "family.jumpFirstFeature": "첫 기능으로",
    "family.jumpLastFeature": "마지막 기능으로",
    "family.centerCurrentFeature": "현재 탭을 가운데로",
    "family.currentFeatureCentered": "현재 기능 탭을 보이는 위치로 되돌렸습니다.",
    "family.currentFeaturePosition": "전체 {total}개 중 {current}번째",
    "family.skipToCurrentContent": "현재 내용으로 건너뛰기",
  },
};

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("kizuna-language");
    if (saved === "ja" || saved === "en" || saved === "zh" || saved === "ko") return saved;
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("en")) return "en";
    if (browser.startsWith("zh")) return "zh";
    if (browser.startsWith("ko")) return "ko";
  }
  return "ja";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("kizuna-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
  };
  const value = useMemo(
    () => ({ language, setLanguage, t: (key: TranslationKey) => messages[language][key] ?? messages.ja[key] }),
    [language]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
