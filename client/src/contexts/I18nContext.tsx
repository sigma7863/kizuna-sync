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
  | "a11y.skipMain"
  | "a11y.routeChanged"
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
  | "home.loading"
  | "home.featureRipple"
  | "family.demoOpen"
  | "family.demoTitle"
  | "family.demoDescription"
  | "family.demoSafetyTitle"
  | "family.demoSafetyDescription"
  | "family.demoStepsTitle"
  | "family.demoStepCreate"
  | "family.demoStepSafety"
  | "family.demoStepCheckIn"
  | "family.demoStepMemory"
  | "family.demoStepRecovery"
  | "family.demoValueTitle"
  | "family.demoValuePrivacy"
  | "family.demoValueLanguage"
  | "family.demoValueAccessibility"
  | "family.demoValuePerformance"
  | "family.demoReset"
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
  | "family.voicePermissionDenied"
  | "family.voiceDeviceMissing"
  | "family.voiceRecordingFailed"
  | "family.voiceTranscriptEmpty"
  | "family.voiceRecoveryHint"
  | "family.voiceRate"
  | "family.voiceRateSlow"
  | "family.voiceRateStandard"
  | "family.voiceRateFast"
  | "family.voiceStopSpeech"
  | "family.voiceReviewTitle"
  | "family.voiceReviewDescription"
  | "family.voiceReviewConfirm"
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
  | "family.skipToCurrentContent"
  | "family.chooseFeature"
  | "family.recentFeatures"
  | "family.pinnedFeatures"
  | "family.pinFeature"
  | "family.unpinFeature"
  | "family.searchFeatures"
  | "family.searchFeaturesPlaceholder"
  | "family.noMatchingFeatures"
  | "family.searchResultsCount"
  | "family.clearSearch"
  | "family.recommendedFeatures"
  | "family.addRecommendation"
  | "family.removeRecommendation"
  | "family.resetRecommendations"
  | "family.shareRecommendations"
  | "family.safetyLauncher"
  | "family.safetyLauncherDescription"
  | "family.emergencyTitle"
  | "family.emergencyDescription"
  | "family.emergencyContacts"
  | "family.emergencyCall"
  | "family.emergencyView"
  | "family.emergencyEvacuationSelected"
  | "family.emergencyNoContacts"
  | "family.emergencyOfflineTitle"
  | "family.emergencyOfflineDescription"
  | "family.emergencyOfflineReady"
  | "family.emergencyOfflineMissing"
  | "family.emergencySave"
  | "family.emergencyRemove"
  | "family.emergencySaved"
  | "family.emergencyRemoved"
  | "family.emergencySavedBadge"
  | "family.emergencySaveConfirmTitle"
  | "family.emergencySaveConfirmDescription"
  | "family.emergencySaveConfirm"
  | "family.emergencyCallConfirmTitle"
  | "family.emergencyCallConfirmDescription"
  | "family.emergencyCallConfirm"
  | "family.offlineRecoveryOfflineTitle"
  | "family.offlineRecoveryOfflineDescription"
  | "family.offlineRecoverySafetyHint"
  | "family.offlineRecoverySyncingTitle"
  | "family.offlineRecoverySyncingDescription"
  | "family.offlineRecoveryPendingTitle"
  | "family.offlineRecoveryPendingDescription"
  | "family.offlineRecoveryRetry"
  | "family.offlineRecoveryRestoredTitle"
  | "family.offlineRecoveryRestoredDescription"
  | "family.offlineRecoveryConflictTitle"
  | "family.offlineRecoveryConflictDescription"
  | "family.offlineRecoveryConflictReview"
  | "family.performanceLowDataActive"
  | "family.performanceLowDataEnable"
  | "family.performanceLowDataDisable"
  | "family.dailyRhythm"
  | "family.dailyRhythmMorning"
  | "family.dailyRhythmDaytime"
  | "family.dailyRhythmEvening"
  | "family.energyMeter"
  | "family.energyMeterDescription"
  | "family.energyLevel1"
  | "family.energyLevel2"
  | "family.energyLevel3"
  | "family.energyLevel4"
  | "family.energyLevel5"
  | "family.energyNote"
  | "family.shareEnergy"
  | "family.energyLoading"
  | "family.energyNotShared"
  | "family.energyPrivacy"
  | "family.widgetTitle"
  | "family.widgetRealtime"
  | "family.widgetConnecting"
  | "family.widgetReconnecting"
  | "family.widgetOffline"
  | "family.widgetLocation"
  | "family.widgetHealth"
  | "family.widgetRipple"
  | "family.widgetLocationEmpty"
  | "family.widgetHealthEmpty"
  | "family.widgetRippleEmpty"
  | "family.widgetRippleShared"
  | "family.widgetOpenSafety"
  | "family.widgetOpenAssistant"
  | "family.widgetOpenAlbum"
  | "family.widgetSteps"
  | "family.displaySettingsTitle"
  | "family.displaySettingsDescription"
  | "family.displayTextSize"
  | "family.displaySizeStandard"
  | "family.displaySizeLarge"
  | "family.displaySizeXLarge"
  | "family.displayHighContrast"
  | "family.displayReducedMotion"
  | "family.displayEnabled"
  | "family.displayDisabled"
  | "family.displayUpdated"
  | "family.checkInTitle"
  | "family.checkInDescription"
  | "family.checkInNote"
  | "family.checkInSubmit"
  | "family.checkInSubmitting"
  | "family.checkInShared"
  | "family.checkInSharedAt"
  | "family.checkInFailed"
  | "family.checkInRetry"
  | "family.checkInRecoveryHint"
  | "family.checkInStatusHelp"
  | "family.checkInStatusOkay"
  | "family.checkInStatusRest"
  | "family.checkInStatusAvailable"
  | "family.checkInPreviewTitle"
  | "family.checkInPrivacy"
  | "family.checkInFollowUpTitle"
  | "family.checkInFollowUpDescription"
  | "family.checkInFollowUpLoading"
  | "family.checkInFollowUpTarget"
  | "family.checkInFollowUpFamily"
  | "family.checkInFollowUpPrivacy"
  | "family.checkInFollowUpNone"
  | "family.checkInFollowUpSend"
  | "family.checkInFollowUpSending"
  | "family.checkInFollowUpSent"
  | "family.checkInFollowUpFailed"
  | "family.checkInFollowUpRestGuardian"
  | "family.checkInFollowUpRestChild"
  | "family.checkInFollowUpRestElderly"
  | "family.checkInFollowUpAvailableGuardian"
  | "family.checkInFollowUpAvailableChild"
  | "family.checkInFollowUpAvailableElderly"
  | "family.checkInHistoryTitle"
  | "family.checkInHistoryDescription"
  | "family.checkInHistoryPersonalTitle"
  | "family.checkInHistoryEmpty"
  | "family.checkInHistoryGuardianTitle"
  | "family.checkInHistoryGuardianEmpty"
  | "family.checkInHistoryNoSharedStatus"
  | "family.checkInHistoryPrivacy"
  | "family.careMessageTitle"
  | "family.careMessageDescription"
  | "family.careMessageCompose"
  | "family.careMessageInputLabel"
  | "family.careMessagePlaceholder"
  | "family.careMessageRecipientLabel"
  | "family.careMessageAll"
  | "family.careMessageAllHelp"
  | "family.careMessagePrivateHelp"
  | "family.careMessageFamily"
  | "family.careMessageSend"
  | "family.careMessageSending"
  | "family.careMessageSent"
  | "family.careMessageFailed"
  | "family.careMessageLoading"
  | "family.careMessageFromTo"
  | "family.careMessageRead"
  | "family.careMessageUnread"
  | "family.careMessageMarkRead"
  | "family.careMessageReadUpdated"
  | "family.careMessageReadFailed"
  | "family.careMessageLater"
  | "family.careMessageDefer"
  | "family.careMessageDeferred"
  | "family.careMessageDeferFailed"
  | "family.careMessageDeferHelp"
  | "family.careMessageEmpty"
  | "family.dailySupportTitle"
  | "family.dailySupportDescription"
  | "family.dailySupportActionGuardian"
  | "family.dailySupportActionChild"
  | "family.dailySupportActionElderly"
  | "family.dailySupportShopping"
  | "family.dailySupportHelp"
  | "family.dailySupportCompleted"
  | "family.dailySupportCheckIn"
  | "family.dailySupportCheckInHelp"
  | "family.albumTitle"
  | "family.albumDescription"
  | "family.albumFavorites"
  | "family.albumDownloadAll"
  | "family.albumAdd"
  | "family.albumSearch"
  | "family.albumClearSearch"
  | "family.albumLoading"
  | "family.albumNoResults"
  | "family.albumNoFavorites"
  | "family.albumEmpty"
  | "family.albumEmptyHelp"
  | "family.albumUploaded"
  | "family.albumUploadFailed"
  | "family.albumFileTypeError"
  | "family.albumFileSizeError"
  | "family.albumDownloadStarted"
  | "family.albumAddFavorite"
  | "family.albumRemoveFavorite"
  | "family.albumFavoriteFailed"
  | "family.albumDescriptionPending"
  | "family.albumSave"
  | "family.albumReaction"
  | "family.albumReactionMessage"
  | "family.albumReactionSent"
  | "family.albumReactionFailed"
  | "family.additionalDailyToolsTitle"
  | "family.additionalDailyToolsDescription"
  | "family.additionalDailyToolsOpen"
  | "family.additionalDailyToolsClose"
  | "family.additionalDailyToolsLoading"
  | "family.sharingTitle"
  | "family.sharingDescription"
  | "family.sharingLocation"
  | "family.sharingLocationDetail"
  | "family.sharingHealth"
  | "family.sharingHealthDetail"
  | "family.sharingCheckIn"
  | "family.sharingCheckInDetail"
  | "family.sharingActive"
  | "family.sharingPaused"
  | "family.sharingSaving"
  | "family.sharingSaved"
  | "family.sharingFailed"
  | "family.sharingGuardianSummary"
  | "family.sharingGuardianDescription"
  | "family.sharingSignalCount";

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
    "a11y.skipMain": "メインコンテンツへ移動",
    "a11y.routeChanged": "画面を更新しました。メインコンテンツへ移動できます。",
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
    "home.loading": "読み込み中…",
    "home.featureRipple": "絆の波紋で家族の「今」を感じる",
    "family.demoOpen": "3分デモ",
    "family.demoTitle": "PC甲子園向け・3分デモガイド",
    "family.demoDescription": "家族をつなぐ安心の流れを、実データを変えずに短時間で案内します。各項目を選ぶと該当画面へ移動します。",
    "family.demoSafetyTitle": "デモモードの安全な使い方",
    "family.demoSafetyDescription": "このガイドは説明専用です。サンプルの家族情報を作成・送信・変更しません。実際の送信は各画面で明確に確認してから行われます。",
    "family.demoStepsTitle": "3分の見せ方",
    "family.demoStepCreate": "家族グループの作成から、役割別の入口を紹介",
    "family.demoStepSafety": "見守り・緊急連絡先・避難情報を確認",
    "family.demoStepCheckIn": "安心チェックインと家族へのやさしい返信を体験",
    "family.demoStepMemory": "思い出アルバムと感謝の反応を紹介",
    "family.demoStepRecovery": "通信不安定時の保存・復帰・再同期を確認",
    "family.demoValueTitle": "審査で伝える4つの価値",
    "family.demoValuePrivacy": "最小開示のプライバシー設計",
    "family.demoValueLanguage": "JA / EN / ZH / KO の4言語",
    "family.demoValueAccessibility": "高齢者にも届くアクセシビリティ",
    "family.demoValuePerformance": "低速端末にも配慮した性能",
    "family.demoReset": "タイムラインへ戻る",
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
    "family.voicePermissionDenied": "マイクの利用が許可されていません",
    "family.voiceDeviceMissing": "使えるマイクが見つかりません",
    "family.voiceRecordingFailed": "録音または文字起こしに失敗しました",
    "family.voiceTranscriptEmpty": "音声を文字として受け取れませんでした",
    "family.voiceRecoveryHint": "端末のマイク設定を確認してから、もう一度試してください。音声の内容は送信されていません。",
    "family.voiceRate": "読み上げ速度",
    "family.voiceRateSlow": "ゆっくり",
    "family.voiceRateStandard": "標準",
    "family.voiceRateFast": "少し速く",
    "family.voiceStopSpeech": "読み上げを止める",
    "family.voiceReviewTitle": "文字起こしを確認",
    "family.voiceReviewDescription": "家族へ送る前に内容を確認し、必要なら修正できます。送信しなければ共有されません。",
    "family.voiceReviewConfirm": "この内容で送信",
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
    "family.chooseFeature": "表示する機能を選ぶ",
    "family.recentFeatures": "最近使った機能",
    "family.pinnedFeatures": "固定した機能",
    "family.pinFeature": "この機能を固定",
    "family.unpinFeature": "この機能の固定を解除",
    "family.searchFeatures": "機能を検索",
    "family.searchFeaturesPlaceholder": "例: 写真、安心、予定",
    "family.noMatchingFeatures": "一致する機能はありません",
    "family.searchResultsCount": "{count}件の機能が見つかりました",
    "family.clearSearch": "検索をクリア",
    "family.recommendedFeatures": "あなたへのおすすめ機能",
    "family.addRecommendation": "おすすめに追加",
    "family.removeRecommendation": "おすすめから外す",
    "family.resetRecommendations": "おすすめを初期状態に戻す",
    "family.shareRecommendations": "おすすめを家族に共有",
    "family.safetyLauncher": "安心のためのクイックアクセス",
    "family.safetyLauncherDescription": "見守り、健康、家族への相談をすぐに開けます",
    "family.emergencyTitle": "緊急・安心アシスト",
    "family.emergencyDescription": "連絡先や避難情報を確認できます。発信は確認後にだけ始まります。",
    "family.emergencyContacts": "今すぐ使う連絡先・避難情報",
    "family.emergencyCall": "確認して電話",
    "family.emergencyView": "確認する",
    "family.emergencyEvacuationSelected": "を確認するために選びました。住所などの詳細は家族の連絡先カードで確認できます。",
    "family.emergencyNoContacts": "使える緊急連絡先・避難情報がまだありません。保護者に連絡先カードの追加を頼んでください。",
    "family.emergencyOfflineTitle": "通信が不安なときのために",
    "family.emergencyOfflineDescription": "この端末に、今表示されている情報だけを保存できます。共有端末では保存しないでください。保存はいつでも消去できます。",
    "family.emergencyOfflineReady": "オフラインです。端末に保存した緊急情報を表示しています。",
    "family.emergencyOfflineMissing": "オフラインです。端末に保存した緊急情報はありません。通信が戻ったら保存できます。",
    "family.emergencySave": "この端末に保存",
    "family.emergencyRemove": "端末から消去",
    "family.emergencySaved": "緊急情報をこの端末に保存しました。",
    "family.emergencyRemoved": "端末に保存した緊急情報を消去しました。",
    "family.emergencySavedBadge": "端末への保存済み",
    "family.emergencySaveConfirmTitle": "この端末に緊急情報を保存しますか？",
    "family.emergencySaveConfirmDescription": "保存するのは、今の役割で表示を許可された連絡先と避難情報だけです。端末を共有している場合は保存しないでください。",
    "family.emergencySaveConfirm": "保存する",
    "family.emergencyCallConfirmTitle": "電話を始める前に確認",
    "family.emergencyCallConfirmDescription": "{name} へ電話を発信します。緊急でない場合は、いったん戻って状況を確認してください。",
    "family.emergencyCallConfirm": "電話を始める",
    "family.offlineRecoveryOfflineTitle": "オフラインで表示しています",
    "family.offlineRecoveryOfflineDescription": "通信が戻るまで、新しい共有や更新は家族へ送られません。",
    "family.offlineRecoverySafetyHint": "緊急連絡先・避難情報は、安全タブに端末保存した内容があれば確認できます。",
    "family.offlineRecoverySyncingTitle": "家族の更新を安全に同期中",
    "family.offlineRecoverySyncingDescription": "待機中の共有を一度ずつ確認して送っています。画面を閉じても重複送信はしません。",
    "family.offlineRecoveryPendingTitle": "送信待ちの共有があります",
    "family.offlineRecoveryPendingDescription": "{count}件の家族アクティビティが通信復帰を待っています。",
    "family.offlineRecoveryRetry": "同期を再試行",
    "family.offlineRecoveryRestoredTitle": "接続が戻りました",
    "family.offlineRecoveryRestoredDescription": "送信待ちの共有がある場合は、順番に同期します。",
    "family.offlineRecoveryConflictTitle": "最新情報の確認が必要です",
    "family.offlineRecoveryConflictDescription": "{count}件の送信待ち操作は、家族の更新と重なったため自動再送を止めました。",
    "family.offlineRecoveryConflictReview": "最新情報を確認する",
    "family.performanceLowDataActive": "省データ表示中です。日常ツールは必要なときに読み込めます。",
    "family.performanceLowDataEnable": "省データ表示にする",
    "family.performanceLowDataDisable": "通常表示に戻す",
    "family.dailyRhythm": "今の時間におすすめの機能",
    "family.dailyRhythmMorning": "朝の準備と見守りを整えましょう",
    "family.dailyRhythmDaytime": "日中の安心と体調をやさしく確認しましょう",
    "family.dailyRhythmEvening": "今日の思い出と会話をゆっくり振り返りましょう",
    "family.energyMeter": "家族の元気度メーター",
    "family.energyMeterDescription": "今の余力を自分で選んで、無理のない声かけへ。",
    "family.energyLevel1": "充電したい",
    "family.energyLevel2": "ゆっくりめ",
    "family.energyLevel3": "ふつう",
    "family.energyLevel4": "元気",
    "family.energyLevel5": "เต็มタン",
    "family.energyNote": "ひとこと（任意）",
    "family.shareEnergy": "今の元気度を共有",
    "family.energyLoading": "元気度を読み込み中です…",
    "family.energyNotShared": "未共有",
    "family.energyPrivacy": "医療情報ではなく、その日の余力を本人が選んで伝えるためのメーターです。",
    "family.widgetTitle": "いまの家族",
    "family.widgetRealtime": "リアルタイム",
    "family.widgetConnecting": "接続中",
    "family.widgetReconnecting": "再接続中",
    "family.widgetOffline": "更新待ち",
    "family.widgetLocation": "見守り",
    "family.widgetHealth": "ヘルス",
    "family.widgetRipple": "波紋・会話",
    "family.widgetLocationEmpty": "位置情報を共有するとここに表示されます",
    "family.widgetHealthEmpty": "ヘルス記録なし",
    "family.widgetRippleEmpty": "新しい波紋を待っています",
    "family.widgetRippleShared": "{name}さんが新しい更新を共有",
    "family.widgetOpenSafety": "見守りと健康を開く",
    "family.widgetOpenAssistant": "家族AIアシスタントを開く",
    "family.widgetOpenAlbum": "家族の思い出を開く",
    "family.widgetSteps": "歩",
    "family.displaySettingsTitle": "やさしい表示設定",
    "family.displaySettingsDescription": "この端末で、見やすさと動きの量を選べます。",
    "family.displayTextSize": "文字の大きさ",
    "family.displaySizeStandard": "標準",
    "family.displaySizeLarge": "大きめ",
    "family.displaySizeXLarge": "最大",
    "family.displayHighContrast": "高コントラスト",
    "family.displayReducedMotion": "動きを控えめにする",
    "family.displayEnabled": "オン",
    "family.displayDisabled": "オフ",
    "family.displayUpdated": "{setting}を{value}にしました。",
    "family.checkInTitle": "安心チェックイン",
    "family.checkInDescription": "ひとタップで「大丈夫」を共有し、保護者へ静かな通知を届けます。",
    "family.checkInNote": "ひとこと添える（任意）",
    "family.checkInSubmit": "大丈夫を家族に知らせる",
    "family.checkInSubmitting": "家族へ届けています…",
    "family.checkInShared": "家族へ「大丈夫」を届けました",
    "family.checkInSharedAt": "{time}に共有済み",
    "family.checkInFailed": "チェックインを送信できませんでした。もう一度お試しください。",
    "family.checkInRetry": "同じ内容でもう一度送る",
    "family.checkInRecoveryHint": "保存できませんでした。内容はこの画面に残っています。通信を確認して、もう一度送れます。",
    "family.checkInStatusHelp": "今の状態を選ぶ（任意）",
    "family.checkInStatusOkay": "大丈夫です",
    "family.checkInStatusRest": "少し休みたいです",
    "family.checkInStatusAvailable": "話せます",
    "family.checkInPreviewTitle": "家族へ共有する内容",
    "family.checkInPrivacy": "この欄に表示された内容だけを共有します。入力中の一言はこの端末に保存しません。",
    "family.checkInFollowUpTitle": "安心のひとことを返す",
    "family.checkInFollowUpDescription": "今、少し支えが必要そうな家族に、短い気づかいを届けます。",
    "family.checkInFollowUpLoading": "最近の安心チェックインを確認しています…",
    "family.checkInFollowUpTarget": "{name}さんへ",
    "family.checkInFollowUpFamily": "家族",
    "family.checkInFollowUpPrivacy": "チェックインに添えられた任意メモは表示しません。状態だけを手がかりに返信します。",
    "family.checkInFollowUpNone": "今は返信が必要なチェックインはありません。いつもの声かけも大切に。",
    "family.checkInFollowUpSend": "このひとことを届ける",
    "family.checkInFollowUpSending": "家族へ届けています…",
    "family.checkInFollowUpSent": "やさしいひとことを届けました",
    "family.checkInFollowUpFailed": "返信を送信できませんでした。もう一度お試しください。",
    "family.checkInFollowUpRestGuardian": "伝えてくれてありがとう。急がなくて大丈夫だよ。",
    "family.checkInFollowUpRestChild": "教えてくれてありがとう。ゆっくり休んでね。",
    "family.checkInFollowUpRestElderly": "ご無理なさらず、ゆっくりお休みください。",
    "family.checkInFollowUpAvailableGuardian": "話せそうなら、今少し声をかけてもいい？",
    "family.checkInFollowUpAvailableChild": "今なら少し話せるんだね。都合のよい時に声をかけるね。",
    "family.checkInFollowUpAvailableElderly": "お話しできそうなのですね。ご都合のよい時にお声がけしますね。",
    "family.checkInHistoryTitle": "安心チェックインの短期履歴",
    "family.checkInHistoryDescription": "直近7件の状態と時刻だけを確認できます。",
    "family.checkInHistoryPersonalTitle": "あなたの直近のチェックイン",
    "family.checkInHistoryEmpty": "まだチェックインはありません。必要なときに、ひとこと知らせてください。",
    "family.checkInHistoryGuardianTitle": "家族の最新共有状態",
    "family.checkInHistoryGuardianEmpty": "まだ共有されたチェックインはありません。",
    "family.checkInHistoryNoSharedStatus": "共有状態なし",
    "family.checkInHistoryPrivacy": "任意メモはこの履歴に表示しません。チェックイン共有を停止している間の状態は家族へ表示されません。",
    "family.careMessageTitle": "家族の見守りメッセージ帳",
    "family.careMessageDescription": "短い気づかいを残して、既読を静かに見守ります。",
    "family.careMessageCompose": "見守りメッセージを作成する",
    "family.careMessageInputLabel": "気づかいのひとこと",
    "family.careMessagePlaceholder": "例：気をつけて帰ってきてね",
    "family.careMessageRecipientLabel": "届ける相手",
    "family.careMessageAll": "みんなへ",
    "family.careMessageAllHelp": "このメッセージは家族全員に表示されます。",
    "family.careMessagePrivateHelp": "このメッセージは選んだ家族にだけ表示されます。",
    "family.careMessageFamily": "家族",
    "family.careMessageSend": "メッセージを残す",
    "family.careMessageSending": "家族へ届けています…",
    "family.careMessageSent": "気づかいのひとことを届けました",
    "family.careMessageFailed": "メッセージを送信できませんでした。もう一度お試しください。",
    "family.careMessageLoading": "メッセージを読み込み中です…",
    "family.careMessageFromTo": "{sender} → {recipient}",
    "family.careMessageRead": "既読",
    "family.careMessageUnread": "未読",
    "family.careMessageMarkRead": "タップで既読にする",
    "family.careMessageReadUpdated": "既読にしました",
    "family.careMessageReadFailed": "既読にできませんでした。もう一度お試しください。",
    "family.careMessageLater": "今は返信しない",
    "family.careMessageDefer": "あとで確認する",
    "family.careMessageDeferred": "あとで確認することにしました。返信を急ぐ必要はありません。",
    "family.careMessageDeferFailed": "後回しの状態を保存できませんでした。もう一度お試しください。",
    "family.careMessageDeferHelp": "今すぐ返信しなくて大丈夫です。準備ができたときに確認できます。",
    "family.careMessageEmpty": "今日の気づかいを、ひとこと残してみましょう。",
    "family.dailySupportTitle": "今日の小さな支え合い",
    "family.dailySupportDescription": "買い物・おたすけ・達成をまとめて、今できることを穏やかに見つけます。",
    "family.dailySupportActionGuardian": "家族の様子を見ながら、無理のない分担を整えましょう。",
    "family.dailySupportActionChild": "できそうなことを一つ選んで、家族を少し助けてみましょう。",
    "family.dailySupportActionElderly": "無理のない範囲で、できることだけを選べば大丈夫です。",
    "family.dailySupportShopping": "買い物",
    "family.dailySupportHelp": "おたすけ",
    "family.dailySupportCompleted": "できたこと",
    "family.dailySupportCheckIn": "予定の前後に安心を知らせる",
    "family.dailySupportCheckInHelp": "外出・帰宅・予定の前後に、短いチェックインで家族へ安心を伝えられます。",
    "family.albumTitle": "家族クラウドアルバム", "family.albumDescription": "写真を共有すると、AIが思い出をやさしく整理します。", "family.albumFavorites": "お気に入り", "family.albumDownloadAll": "まとめて保存", "family.albumAdd": "写真を追加", "family.albumSearch": "AIタグや説明から思い出を探す", "family.albumClearSearch": "検索をクリア", "family.albumLoading": "読み込み中…", "family.albumNoResults": "一致する思い出が見つかりませんでした", "family.albumNoFavorites": "お気に入りの写真はまだありません", "family.albumEmpty": "最初の家族写真を追加しましょう", "family.albumEmptyHelp": "AIが説明とタグを付け、思い出を探しやすくします。", "family.albumUploaded": "写真をアルバムに追加し、AIタグを付けました", "family.albumUploadFailed": "写真の追加に失敗しました", "family.albumFileTypeError": "JPEG・PNG・WebP形式の画像を選択してください", "family.albumFileSizeError": "写真は8MB以下にしてください", "family.albumDownloadStarted": "{count}枚の保存を開始しました", "family.albumAddFavorite": "お気に入りに追加", "family.albumRemoveFavorite": "お気に入りから外す", "family.albumFavoriteFailed": "お気に入りを更新できませんでした", "family.albumDescriptionPending": "AIの説明を準備中です", "family.albumSave": "保存", "family.albumReaction": "ありがとうを送る", "family.albumReactionMessage": "この思い出を共有してくれてありがとう。", "family.albumReactionSent": "思い出へのありがとうを家族へ届けました", "family.albumReactionFailed": "ありがとうを送れませんでした。もう一度お試しください。",
    "family.additionalDailyToolsTitle": "もっと家族の毎日を整えるツール",
    "family.additionalDailyToolsDescription": "必要なときだけ開くことで、最初の表示を軽く保ちます。",
    "family.additionalDailyToolsOpen": "追加ツールを開く",
    "family.additionalDailyToolsClose": "追加ツールを閉じる",
    "family.additionalDailyToolsLoading": "追加ツールを準備しています…",
    "family.sharingTitle": "見守り共有の設定",
    "family.sharingDescription": "共有する内容はいつでも自分で選べます。停止中の項目は家族の見守り画面に新しく反映されません。",
    "family.sharingLocation": "位置情報",
    "family.sharingLocationDetail": "現在地と安全地帯の見守りに使います。",
    "family.sharingHealth": "健康の目安",
    "family.sharingHealthDetail": "歩数など、日々の様子を穏やかに共有します。",
    "family.sharingCheckIn": "安心チェックイン",
    "family.sharingCheckInDetail": "大丈夫・休みたい・話せるという状態を共有します。",
    "family.sharingActive": "共有中",
    "family.sharingPaused": "一時停止中",
    "family.sharingSaving": "共有設定を更新しています…",
    "family.sharingSaved": "共有設定を更新しました",
    "family.sharingFailed": "共有設定を更新できませんでした。もう一度お試しください。",
    "family.sharingGuardianSummary": "家族の共有状態",
    "family.sharingGuardianDescription": "内容そのものではなく、各家族が共有を選んでいる項目数だけを表示します。",
    "family.sharingSignalCount": "{count} / 3 項目を共有中",
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
    "a11y.skipMain": "Skip to main content",
    "a11y.routeChanged": "Screen updated. You can move to the main content.",
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
    "home.loading": "Loading…",
    "home.featureRipple": "Feel your family's present moment through Kizuna ripples",
    "family.demoOpen": "3-minute demo",
    "family.demoTitle": "PC Koshien 3-minute demo guide",
    "family.demoDescription": "Introduce the family-safety journey quickly without changing real data. Select a step to move to the related screen.",
    "family.demoSafetyTitle": "Using demo mode safely",
    "family.demoSafetyDescription": "This guide is for explanation only. It does not create, send, or change family information. Actual sending is confirmed clearly on each screen.",
    "family.demoStepsTitle": "A three-minute story",
    "family.demoStepCreate": "Introduce family-group creation and role-based entry points",
    "family.demoStepSafety": "Review safety, emergency contacts, and evacuation information",
    "family.demoStepCheckIn": "Try a reassurance check-in and a gentle family response",
    "family.demoStepMemory": "Introduce the memories album and thankful reactions",
    "family.demoStepRecovery": "Review saving, recovery, and re-sync for unstable connections",
    "family.demoValueTitle": "Four values to communicate",
    "family.demoValuePrivacy": "Least-disclosure privacy design",
    "family.demoValueLanguage": "Four languages: JA / EN / ZH / KO",
    "family.demoValueAccessibility": "Accessibility that reaches older adults",
    "family.demoValuePerformance": "Performance for slower devices",
    "family.demoReset": "Return to timeline",
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
    "family.voicePermissionDenied": "Microphone access is not permitted",
    "family.voiceDeviceMissing": "No microphone is available",
    "family.voiceRecordingFailed": "Recording or transcription failed",
    "family.voiceTranscriptEmpty": "We could not turn the audio into text",
    "family.voiceRecoveryHint": "Check this device's microphone settings, then try again. Your voice content was not sent.",
    "family.voiceRate": "Speech rate",
    "family.voiceRateSlow": "Slower",
    "family.voiceRateStandard": "Standard",
    "family.voiceRateFast": "Faster",
    "family.voiceStopSpeech": "Stop reading",
    "family.voiceReviewTitle": "Review transcription",
    "family.voiceReviewDescription": "Review and edit the text before sending it to family. Nothing is shared unless you send it.",
    "family.voiceReviewConfirm": "Send this text",
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
    "family.chooseFeature": "Choose a feature to view",
    "family.recentFeatures": "Recently used features",
    "family.pinnedFeatures": "Pinned features",
    "family.pinFeature": "Pin this feature",
    "family.unpinFeature": "Unpin this feature",
    "family.searchFeatures": "Search features",
    "family.searchFeaturesPlaceholder": "For example: photos, safety, schedule",
    "family.noMatchingFeatures": "No matching features found",
    "family.searchResultsCount": "{count} features found",
    "family.clearSearch": "Clear search",
    "family.recommendedFeatures": "Recommended for you",
    "family.addRecommendation": "Add to recommendations",
    "family.removeRecommendation": "Remove from recommendations",
    "family.resetRecommendations": "Reset recommendations",
    "family.shareRecommendations": "Share recommendations with family",
    "family.safetyLauncher": "Quick access for peace of mind",
    "family.safetyLauncherDescription": "Open safety, health, or family support right away",
    "family.emergencyTitle": "Emergency & safety assist",
    "family.emergencyDescription": "Review contacts and evacuation information. A call starts only after confirmation.",
    "family.emergencyContacts": "Contacts and evacuation information",
    "family.emergencyCall": "Confirm to call",
    "family.emergencyView": "Review",
    "family.emergencyEvacuationSelected": " was selected for review. Check the family contact card for details such as the address.",
    "family.emergencyNoContacts": "No emergency contact or evacuation information is available yet. Ask a guardian to add a contact card.",
    "family.emergencyOfflineTitle": "For unstable connections",
    "family.emergencyOfflineDescription": "You can save only the information shown here on this device. Do not save it on a shared device. You can remove it at any time.",
    "family.emergencyOfflineReady": "You are offline. Showing emergency information saved on this device.",
    "family.emergencyOfflineMissing": "You are offline and no emergency information is saved on this device. You can save it when the connection returns.",
    "family.emergencySave": "Save on this device",
    "family.emergencyRemove": "Remove from device",
    "family.emergencySaved": "Emergency information was saved on this device.",
    "family.emergencyRemoved": "Emergency information saved on this device was removed.",
    "family.emergencySavedBadge": "Saved on this device",
    "family.emergencySaveConfirmTitle": "Save emergency information on this device?",
    "family.emergencySaveConfirmDescription": "Only contacts and evacuation information permitted for your current role will be saved. Do not save this information on a shared device.",
    "family.emergencySaveConfirm": "Save",
    "family.emergencyCallConfirmTitle": "Confirm before calling",
    "family.emergencyCallConfirmDescription": "You are about to call {name}. If this is not urgent, go back and check the situation first.",
    "family.emergencyCallConfirm": "Start call",
    "family.offlineRecoveryOfflineTitle": "You are offline",
    "family.offlineRecoveryOfflineDescription": "New shares and updates will not reach family until the connection returns.",
    "family.offlineRecoverySafetyHint": "If you saved it on this device, use the Safety tab to review emergency contacts and evacuation information.",
    "family.offlineRecoverySyncingTitle": "Syncing family updates safely",
    "family.offlineRecoverySyncingDescription": "Queued shares are being sent one at a time. Closing this screen will not send duplicates.",
    "family.offlineRecoveryPendingTitle": "Family shares are waiting to send",
    "family.offlineRecoveryPendingDescription": "{count} family activities are waiting for the connection to return.",
    "family.offlineRecoveryRetry": "Retry sync",
    "family.offlineRecoveryRestoredTitle": "Connection restored",
    "family.offlineRecoveryRestoredDescription": "Any queued shares will sync in order.",
    "family.offlineRecoveryConflictTitle": "Review the latest information",
    "family.offlineRecoveryConflictDescription": "{count} queued actions overlap with a family update, so automatic resend was stopped.",
    "family.offlineRecoveryConflictReview": "Review latest information",
    "family.performanceLowDataActive": "Low-data mode is on. Daily tools can load when you need them.",
    "family.performanceLowDataEnable": "Use low-data mode",
    "family.performanceLowDataDisable": "Use standard display",
    "family.dailyRhythm": "Helpful for this time of day",
    "family.dailyRhythmMorning": "Prepare for the morning and stay connected",
    "family.dailyRhythmDaytime": "Gently check daytime safety and wellbeing",
    "family.dailyRhythmEvening": "Reflect on today's memories and conversations",
    "family.energyMeter": "Family energy meter",
    "family.energyMeterDescription": "Choose your current capacity for kinder, pressure-free support.",
    "family.energyLevel1": "Need to recharge",
    "family.energyLevel2": "Taking it slowly",
    "family.energyLevel3": "Doing okay",
    "family.energyLevel4": "Feeling good",
    "family.energyLevel5": "Fully charged",
    "family.energyNote": "A short note (optional)",
    "family.shareEnergy": "Share my energy level",
    "family.energyLoading": "Loading energy levels…",
    "family.energyNotShared": "Not shared yet",
    "family.energyPrivacy": "This is not medical information; it is a self-chosen way to share today's capacity.",
    "family.widgetTitle": "Family now",
    "family.widgetRealtime": "Live",
    "family.widgetConnecting": "Connecting",
    "family.widgetReconnecting": "Reconnecting",
    "family.widgetOffline": "Waiting for updates",
    "family.widgetLocation": "Safety",
    "family.widgetHealth": "Health",
    "family.widgetRipple": "Ripple & chat",
    "family.widgetLocationEmpty": "Shared location will appear here",
    "family.widgetHealthEmpty": "No health record",
    "family.widgetRippleEmpty": "Waiting for a new ripple",
    "family.widgetRippleShared": "{name} shared a new update",
    "family.widgetOpenSafety": "Open safety and health",
    "family.widgetOpenAssistant": "Open family AI assistant",
    "family.widgetOpenAlbum": "Open family memories",
    "family.widgetSteps": " steps",
    "family.displaySettingsTitle": "Gentle display settings",
    "family.displaySettingsDescription": "Choose readability and motion for this device.",
    "family.displayTextSize": "Text size",
    "family.displaySizeStandard": "Standard",
    "family.displaySizeLarge": "Large",
    "family.displaySizeXLarge": "Extra large",
    "family.displayHighContrast": "High contrast",
    "family.displayReducedMotion": "Reduce motion",
    "family.displayEnabled": "On",
    "family.displayDisabled": "Off",
    "family.displayUpdated": "{setting} is now {value}.",
    "family.checkInTitle": "Safety check-in",
    "family.checkInDescription": "Share that you are okay with one tap and quietly notify a guardian.",
    "family.checkInNote": "A short note (optional)",
    "family.checkInSubmit": "Let my family know I am okay",
    "family.checkInSubmitting": "Sending to your family…",
    "family.checkInShared": "Your “I’m okay” check-in was sent to family",
    "family.checkInSharedAt": "Shared at {time}",
    "family.checkInFailed": "Your check-in could not be sent. Please try again.",
    "family.checkInRetry": "Send the same check-in again",
    "family.checkInRecoveryHint": "It could not be saved. Your content remains on this screen. Check the connection and try again.",
    "family.checkInStatusHelp": "Choose how you are feeling (optional)",
    "family.checkInStatusOkay": "I am okay",
    "family.checkInStatusRest": "I need a little rest",
    "family.checkInStatusAvailable": "I am available to talk",
    "family.checkInPreviewTitle": "What your family will receive",
    "family.checkInPrivacy": "Only the content shown here will be shared. Your draft note is not stored on this device.",
    "family.checkInFollowUpTitle": "Send a caring reply",
    "family.checkInFollowUpDescription": "Offer a short, gentle message to a family member who may need support now.",
    "family.checkInFollowUpLoading": "Checking recent safety check-ins…",
    "family.checkInFollowUpTarget": "For {name}",
    "family.checkInFollowUpFamily": "Family member",
    "family.checkInFollowUpPrivacy": "Optional notes from the check-in are not shown. This reply is guided only by the shared status.",
    "family.checkInFollowUpNone": "There are no check-ins needing a reply right now. Everyday kind words still matter.",
    "family.checkInFollowUpSend": "Send this caring message",
    "family.checkInFollowUpSending": "Sending to your family…",
    "family.checkInFollowUpSent": "Your caring message was sent",
    "family.checkInFollowUpFailed": "Your reply could not be sent. Please try again.",
    "family.checkInFollowUpRestGuardian": "Thank you for telling us. There is no need to rush.",
    "family.checkInFollowUpRestChild": "Thank you for letting us know. Please take a gentle rest.",
    "family.checkInFollowUpRestElderly": "Please do not overdo it and take your time to rest.",
    "family.checkInFollowUpAvailableGuardian": "If you feel ready to talk, may I check in with you now?",
    "family.checkInFollowUpAvailableChild": "You can talk a little now. I will reach out when it suits you.",
    "family.checkInFollowUpAvailableElderly": "It sounds like you may be ready to talk. I will reach out at a convenient time.",
    "family.checkInHistoryTitle": "Recent reassurance check-ins",
    "family.checkInHistoryDescription": "Review only the status and time of your seven most recent check-ins.",
    "family.checkInHistoryPersonalTitle": "Your recent check-ins",
    "family.checkInHistoryEmpty": "No check-ins yet. Send a short signal whenever you need one.",
    "family.checkInHistoryGuardianTitle": "Family's latest shared status",
    "family.checkInHistoryGuardianEmpty": "No shared check-ins yet.",
    "family.checkInHistoryNoSharedStatus": "No shared status",
    "family.checkInHistoryPrivacy": "Optional notes never appear in this history. Check-ins sent while sharing is paused are not shown to family.",
    "family.careMessageTitle": "Family care messages",
    "family.careMessageDescription": "Leave a brief caring note and quietly keep track of when it is read.",
    "family.careMessageCompose": "Compose a care message",
    "family.careMessageInputLabel": "A caring note",
    "family.careMessagePlaceholder": "For example: Please travel home safely.",
    "family.careMessageRecipientLabel": "Send to",
    "family.careMessageAll": "Everyone",
    "family.careMessageAllHelp": "This message will be visible to every family member.",
    "family.careMessagePrivateHelp": "This message will be visible only to the selected family member.",
    "family.careMessageFamily": "Family member",
    "family.careMessageSend": "Leave this message",
    "family.careMessageSending": "Sending to your family…",
    "family.careMessageSent": "Your caring note was sent",
    "family.careMessageFailed": "Your message could not be sent. Please try again.",
    "family.careMessageLoading": "Loading messages…",
    "family.careMessageFromTo": "{sender} → {recipient}",
    "family.careMessageRead": "Read",
    "family.careMessageUnread": "Unread",
    "family.careMessageMarkRead": "Tap to mark as read",
    "family.careMessageReadUpdated": "Marked as read",
    "family.careMessageReadFailed": "Could not mark as read. Please try again.",
    "family.careMessageLater": "Not replying now",
    "family.careMessageDefer": "Review later",
    "family.careMessageDeferred": "Saved to review later. There is no need to reply right away.",
    "family.careMessageDeferFailed": "Could not save the later state. Please try again.",
    "family.careMessageDeferHelp": "You do not need to reply right away. Review it when you feel ready.",
    "family.careMessageEmpty": "Leave a small caring note for today.",
    "family.dailySupportTitle": "Small ways to help today",
    "family.dailySupportDescription": "Bring shopping, help requests, and achievements together to gently find what you can do now.",
    "family.dailySupportActionGuardian": "Coordinate a manageable share while keeping an eye on how everyone is doing.",
    "family.dailySupportActionChild": "Choose one thing you can do and give your family a little help.",
    "family.dailySupportActionElderly": "Choose only what feels comfortable. That is more than enough.",
    "family.dailySupportShopping": "Shopping",
    "family.dailySupportHelp": "Help",
    "family.dailySupportCompleted": "Done",
    "family.dailySupportCheckIn": "Share reassurance around plans",
    "family.dailySupportCheckInHelp": "Before or after going out, returning home, or a plan, a short check-in can reassure your family.",
    "family.albumTitle": "Family cloud album", "family.albumDescription": "When you share a photo, AI gently organizes the memory.", "family.albumFavorites": "Favorites", "family.albumDownloadAll": "Save all", "family.albumAdd": "Add photo", "family.albumSearch": "Find memories by AI tags or descriptions", "family.albumClearSearch": "Clear search", "family.albumLoading": "Loading…", "family.albumNoResults": "No matching memories found", "family.albumNoFavorites": "No favorite photos yet", "family.albumEmpty": "Add your first family photo", "family.albumEmptyHelp": "AI adds descriptions and tags to make memories easier to find.", "family.albumUploaded": "Photo added and tagged by AI", "family.albumUploadFailed": "Could not add the photo", "family.albumFileTypeError": "Choose a JPEG, PNG, or WebP image", "family.albumFileSizeError": "Choose a photo up to 8 MB", "family.albumDownloadStarted": "Started saving {count} photos", "family.albumAddFavorite": "Add to favorites", "family.albumRemoveFavorite": "Remove from favorites", "family.albumFavoriteFailed": "Could not update favorites", "family.albumDescriptionPending": "Preparing AI description", "family.albumSave": "Save", "family.albumReaction": "Send thanks", "family.albumReactionMessage": "Thank you for sharing this memory.", "family.albumReactionSent": "Sent a thank-you for this memory to your family", "family.albumReactionFailed": "Could not send thanks. Please try again.",
    "family.additionalDailyToolsTitle": "More tools for family life",
    "family.additionalDailyToolsDescription": "Open these only when needed to keep the first view lightweight.",
    "family.additionalDailyToolsOpen": "Open more tools",
    "family.additionalDailyToolsClose": "Close more tools",
    "family.additionalDailyToolsLoading": "Preparing more tools…",
    "family.sharingTitle": "Sharing settings for family care",
    "family.sharingDescription": "You choose what to share at any time. Paused signals will not be newly reflected in family care views.",
    "family.sharingLocation": "Location",
    "family.sharingLocationDetail": "Used for current-location and safe-area care.",
    "family.sharingHealth": "Wellbeing signals",
    "family.sharingHealthDetail": "Gently shares daily signals such as step counts.",
    "family.sharingCheckIn": "Reassurance check-in",
    "family.sharingCheckInDetail": "Shares whether you are okay, need rest, or are available to talk.",
    "family.sharingActive": "Sharing",
    "family.sharingPaused": "Paused",
    "family.sharingSaving": "Updating sharing settings…",
    "family.sharingSaved": "Sharing settings updated",
    "family.sharingFailed": "Could not update sharing settings. Please try again.",
    "family.sharingGuardianSummary": "Family sharing status",
    "family.sharingGuardianDescription": "This shows only the number of signals each family member chose to share, not their content.",
    "family.sharingSignalCount": "Sharing {count} / 3 signals",
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
    "a11y.skipMain": "跳至主要内容",
    "a11y.routeChanged": "页面已更新。您可以前往主要内容。",
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
    "home.loading": "正在加载…",
    "home.featureRipple": "通过羁绊波纹感受家人的此刻",
    "family.demoOpen": "3分钟演示",
    "family.demoTitle": "PC甲子园3分钟演示指南",
    "family.demoDescription": "无需更改真实数据，即可快速介绍家人安心的使用流程。选择步骤可前往相关页面。",
    "family.demoSafetyTitle": "安全使用演示模式",
    "family.demoSafetyDescription": "本指南仅用于说明，不会创建、发送或更改家庭信息。实际发送前会在各页面明确确认。",
    "family.demoStepsTitle": "3分钟展示流程",
    "family.demoStepCreate": "介绍创建家庭群组与按角色设计的入口",
    "family.demoStepSafety": "查看守护、紧急联系人和避难信息",
    "family.demoStepCheckIn": "体验安心报到与家人的温柔回应",
    "family.demoStepMemory": "介绍回忆相册与感谢互动",
    "family.demoStepRecovery": "查看网络不稳定时的保存、恢复与重新同步",
    "family.demoValueTitle": "向评审传达的四项价值",
    "family.demoValuePrivacy": "最小披露的隐私设计",
    "family.demoValueLanguage": "JA / EN / ZH / KO 四种语言",
    "family.demoValueAccessibility": "让高龄者也能使用的无障碍设计",
    "family.demoValuePerformance": "兼顾低速设备的性能",
    "family.demoReset": "返回时间线",
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
    "family.voicePermissionDenied": "未获得麦克风使用许可",
    "family.voiceDeviceMissing": "找不到可用的麦克风",
    "family.voiceRecordingFailed": "录音或转写失败",
    "family.voiceTranscriptEmpty": "无法将语音转换为文字",
    "family.voiceRecoveryHint": "请检查设备的麦克风设置后重试。您的语音内容尚未发送。",
    "family.voiceRate": "朗读速度",
    "family.voiceRateSlow": "较慢",
    "family.voiceRateStandard": "标准",
    "family.voiceRateFast": "较快",
    "family.voiceStopSpeech": "停止朗读",
    "family.voiceReviewTitle": "确认转写内容",
    "family.voiceReviewDescription": "发送给家人前可确认并修改文字。除非发送，否则不会共享。",
    "family.voiceReviewConfirm": "按此内容发送",
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
    "family.chooseFeature": "选择要查看的功能",
    "family.recentFeatures": "最近使用的功能",
    "family.pinnedFeatures": "已固定的功能",
    "family.pinFeature": "固定此功能",
    "family.unpinFeature": "取消固定此功能",
    "family.searchFeatures": "搜索功能",
    "family.searchFeaturesPlaceholder": "例如：照片、安全、日程",
    "family.noMatchingFeatures": "未找到匹配的功能",
    "family.searchResultsCount": "找到 {count} 个功能",
    "family.clearSearch": "清除搜索",
    "family.recommendedFeatures": "为您推荐的功能",
    "family.addRecommendation": "添加到推荐",
    "family.removeRecommendation": "从推荐中移除",
    "family.resetRecommendations": "重置推荐",
    "family.shareRecommendations": "与家人分享推荐",
    "family.safetyLauncher": "安心快捷访问",
    "family.safetyLauncherDescription": "立即打开安全、健康或家庭支持功能",
    "family.emergencyTitle": "紧急与安心协助",
    "family.emergencyDescription": "可查看联系人和避难信息。只有确认后才会开始拨号。",
    "family.emergencyContacts": "立即可用的联系人与避难信息",
    "family.emergencyCall": "确认后拨打",
    "family.emergencyView": "查看",
    "family.emergencyEvacuationSelected": "已被选中查看。请在家庭联系人卡中查看地址等详细信息。",
    "family.emergencyNoContacts": "目前没有可用的紧急联系人或避难信息。请请监护人添加联系人卡。",
    "family.emergencyOfflineTitle": "网络不稳定时",
    "family.emergencyOfflineDescription": "您可以只将这里显示的信息保存在此设备上。请勿保存在共享设备上，且可随时删除。",
    "family.emergencyOfflineReady": "当前离线。正在显示保存在此设备上的紧急信息。",
    "family.emergencyOfflineMissing": "当前离线，且此设备未保存紧急信息。恢复网络后可以保存。",
    "family.emergencySave": "保存到此设备",
    "family.emergencyRemove": "从设备删除",
    "family.emergencySaved": "紧急信息已保存到此设备。",
    "family.emergencyRemoved": "已删除保存在此设备上的紧急信息。",
    "family.emergencySavedBadge": "已保存到此设备",
    "family.emergencySaveConfirmTitle": "要将紧急信息保存到此设备吗？",
    "family.emergencySaveConfirmDescription": "只会保存当前角色允许显示的联系人和避难信息。请勿保存在共享设备上。",
    "family.emergencySaveConfirm": "保存",
    "family.emergencyCallConfirmTitle": "拨号前确认",
    "family.emergencyCallConfirmDescription": "即将拨打 {name}。如果情况并不紧急，请返回后先确认情况。",
    "family.emergencyCallConfirm": "开始拨号",
    "family.offlineRecoveryOfflineTitle": "当前处于离线状态",
    "family.offlineRecoveryOfflineDescription": "网络恢复前，新的共享和更新不会发送给家人。",
    "family.offlineRecoverySafetyHint": "若已保存到此设备，可在安全标签查看紧急联系人和避难信息。",
    "family.offlineRecoverySyncingTitle": "正在安全同步家庭更新",
    "family.offlineRecoverySyncingDescription": "待发送的共享内容正逐项发送。关闭此页面不会重复发送。",
    "family.offlineRecoveryPendingTitle": "有家庭共享等待发送",
    "family.offlineRecoveryPendingDescription": "有 {count} 项家庭活动正在等待网络恢复。",
    "family.offlineRecoveryRetry": "重新尝试同步",
    "family.offlineRecoveryRestoredTitle": "网络已恢复",
    "family.offlineRecoveryRestoredDescription": "待发送的共享内容将按顺序同步。",
    "family.offlineRecoveryConflictTitle": "需要确认最新信息",
    "family.offlineRecoveryConflictDescription": "有 {count} 项待发送操作与家庭更新重叠，已停止自动重发。",
    "family.offlineRecoveryConflictReview": "查看最新信息",
    "family.performanceLowDataActive": "已开启省流量模式。需要时可加载日常工具。",
    "family.performanceLowDataEnable": "使用省流量模式",
    "family.performanceLowDataDisable": "恢复标准显示",
    "family.dailyRhythm": "适合当前时段的功能",
    "family.dailyRhythmMorning": "准备早晨，并与家人保持联系",
    "family.dailyRhythmDaytime": "温和地确认日间安全与健康状况",
    "family.dailyRhythmEvening": "回顾今天的回忆与交流",
    "family.energyMeter": "家人的精力状态",
    "family.energyMeterDescription": "自己选择当前精力，让家人的关心更轻松。",
    "family.energyLevel1": "想要充电",
    "family.energyLevel2": "慢慢来",
    "family.energyLevel3": "还不错",
    "family.energyLevel4": "精神不错",
    "family.energyLevel5": "精力满满",
    "family.energyNote": "一句话（可选）",
    "family.shareEnergy": "分享我的精力状态",
    "family.energyLoading": "正在读取精力状态…",
    "family.energyNotShared": "尚未分享",
    "family.energyPrivacy": "这不是医疗信息，而是本人选择分享当天精力状态的方式。",
    "family.widgetTitle": "家人现在的状态",
    "family.widgetRealtime": "实时",
    "family.widgetConnecting": "正在连接",
    "family.widgetReconnecting": "正在重新连接",
    "family.widgetOffline": "等待更新",
    "family.widgetLocation": "守护",
    "family.widgetHealth": "健康",
    "family.widgetRipple": "涟漪与对话",
    "family.widgetLocationEmpty": "分享位置后会显示在这里",
    "family.widgetHealthEmpty": "暂无健康记录",
    "family.widgetRippleEmpty": "正在等待新的涟漪",
    "family.widgetRippleShared": "{name} 分享了新的动态",
    "family.widgetOpenSafety": "打开守护与健康",
    "family.widgetOpenAssistant": "打开家庭 AI 助手",
    "family.widgetOpenAlbum": "打开家庭回忆",
    "family.widgetSteps": "步",
    "family.displaySettingsTitle": "易读显示设置",
    "family.displaySettingsDescription": "为此设备选择易读程度和动画效果。",
    "family.displayTextSize": "文字大小",
    "family.displaySizeStandard": "标准",
    "family.displaySizeLarge": "较大",
    "family.displaySizeXLarge": "最大",
    "family.displayHighContrast": "高对比度",
    "family.displayReducedMotion": "减少动画",
    "family.displayEnabled": "开启",
    "family.displayDisabled": "关闭",
    "family.displayUpdated": "{setting}已设为{value}。",
    "family.checkInTitle": "安心报到",
    "family.checkInDescription": "轻点一下即可分享“我没事”，并安静地通知监护人。",
    "family.checkInNote": "一句话（可选）",
    "family.checkInSubmit": "告诉家人我没事",
    "family.checkInSubmitting": "正在发送给家人…",
    "family.checkInShared": "已向家人发送“我没事”",
    "family.checkInSharedAt": "已于{time}分享",
    "family.checkInFailed": "无法发送报到，请再试一次。",
    "family.checkInRetry": "再次发送相同报到",
    "family.checkInRecoveryHint": "无法保存。内容仍保留在此页面。请检查网络后重试。",
    "family.checkInStatusHelp": "选择现在的状态（可选）",
    "family.checkInStatusOkay": "我没事",
    "family.checkInStatusRest": "我想稍微休息一下",
    "family.checkInStatusAvailable": "我可以聊聊",
    "family.checkInPreviewTitle": "将与家人分享的内容",
    "family.checkInPrivacy": "只会分享此处显示的内容。正在输入的一句话不会保存在此设备上。",
    "family.checkInFollowUpTitle": "送上一句关心",
    "family.checkInFollowUpDescription": "向此刻可能需要支持的家人送上一句简短、温和的关心。",
    "family.checkInFollowUpLoading": "正在查看最近的安心报到…",
    "family.checkInFollowUpTarget": "发送给{name}",
    "family.checkInFollowUpFamily": "家人",
    "family.checkInFollowUpPrivacy": "不会显示报到时附加的可选留言。回复只根据已分享的状态生成。",
    "family.checkInFollowUpNone": "现在没有需要回复的报到。平日的一句关心也很重要。",
    "family.checkInFollowUpSend": "发送这句关心",
    "family.checkInFollowUpSending": "正在发送给家人…",
    "family.checkInFollowUpSent": "已送出温暖的关心",
    "family.checkInFollowUpFailed": "无法发送回复，请再试一次。",
    "family.checkInFollowUpRestGuardian": "谢谢你告诉我们。不必着急。",
    "family.checkInFollowUpRestChild": "谢谢你告诉我们。请好好休息一下。",
    "family.checkInFollowUpRestElderly": "请不要勉强自己，慢慢休息。",
    "family.checkInFollowUpAvailableGuardian": "如果你现在想聊聊，我可以来问候你吗？",
    "family.checkInFollowUpAvailableChild": "你现在可以聊一会儿。我会在合适的时候联系你。",
    "family.checkInFollowUpAvailableElderly": "看来您现在可以聊聊。我会在方便的时候问候您。",
    "family.checkInHistoryTitle": "安心报平安短期记录",
    "family.checkInHistoryDescription": "仅查看最近7次报平安的状态和时间。",
    "family.checkInHistoryPersonalTitle": "您的最近报平安",
    "family.checkInHistoryEmpty": "还没有报平安记录。需要时请发送简短提示。",
    "family.checkInHistoryGuardianTitle": "家人的最新共享状态",
    "family.checkInHistoryGuardianEmpty": "还没有已共享的报平安。",
    "family.checkInHistoryNoSharedStatus": "没有共享状态",
    "family.checkInHistoryPrivacy": "可选留言不会显示在此记录中。暂停共享期间的报平安不会向家人显示。",
    "family.careMessageTitle": "家人关怀留言册",
    "family.careMessageDescription": "留下简短的关心，并安静地查看是否已读。",
    "family.careMessageCompose": "撰写关怀留言",
    "family.careMessageInputLabel": "一句关心",
    "family.careMessagePlaceholder": "例如：回家路上请注意安全。",
    "family.careMessageRecipientLabel": "发送给",
    "family.careMessageAll": "所有人",
    "family.careMessageAllHelp": "这条留言会显示给所有家人。",
    "family.careMessagePrivateHelp": "这条留言只会显示给选定的家人。",
    "family.careMessageFamily": "家人",
    "family.careMessageSend": "留下这条留言",
    "family.careMessageSending": "正在发送给家人…",
    "family.careMessageSent": "已送出关心的话语",
    "family.careMessageFailed": "无法发送留言，请再试一次。",
    "family.careMessageLoading": "正在加载留言…",
    "family.careMessageFromTo": "{sender} → {recipient}",
    "family.careMessageRead": "已读",
    "family.careMessageUnread": "未读",
    "family.careMessageMarkRead": "轻点标记为已读",
    "family.careMessageReadUpdated": "已标记为已读",
    "family.careMessageReadFailed": "无法标记为已读，请再试一次。",
    "family.careMessageLater": "暂不回复",
    "family.careMessageDefer": "稍后查看",
    "family.careMessageDeferred": "已保存为稍后查看。无需马上回复。",
    "family.careMessageDeferFailed": "无法保存稍后状态，请再试一次。",
    "family.careMessageDeferHelp": "您不需要马上回复。准备好时再查看即可。",
    "family.careMessageEmpty": "今天也留下简短的一句关心吧。",
    "family.dailySupportTitle": "今天的小小互助",
    "family.dailySupportDescription": "汇总购物、求助和完成事项，温和地找到现在能做的事。",
    "family.dailySupportActionGuardian": "留意家人的状态，安排力所能及的分担吧。",
    "family.dailySupportActionChild": "选择一件能做的事，给家人一点帮助吧。",
    "family.dailySupportActionElderly": "只选择感觉舒适的事情就好，这已经足够了。",
    "family.dailySupportShopping": "购物",
    "family.dailySupportHelp": "帮忙",
    "family.dailySupportCompleted": "已完成",
    "family.dailySupportCheckIn": "在计划前后报平安",
    "family.dailySupportCheckInHelp": "外出、回家或计划前后，可用简短报平安让家人放心。",
    "family.albumTitle": "家庭云相册", "family.albumDescription": "分享照片后，AI会温柔整理这段回忆。", "family.albumFavorites": "收藏", "family.albumDownloadAll": "全部保存", "family.albumAdd": "添加照片", "family.albumSearch": "通过AI标签或说明查找回忆", "family.albumClearSearch": "清除搜索", "family.albumLoading": "正在加载…", "family.albumNoResults": "没有找到匹配的回忆", "family.albumNoFavorites": "还没有收藏的照片", "family.albumEmpty": "添加第一张家庭照片吧", "family.albumEmptyHelp": "AI会添加说明和标签，让回忆更容易找到。", "family.albumUploaded": "已添加照片并生成AI标签", "family.albumUploadFailed": "无法添加照片", "family.albumFileTypeError": "请选择JPEG、PNG或WebP图像", "family.albumFileSizeError": "请选择8MB以内的照片", "family.albumDownloadStarted": "已开始保存{count}张照片", "family.albumAddFavorite": "添加到收藏", "family.albumRemoveFavorite": "从收藏中移除", "family.albumFavoriteFailed": "无法更新收藏", "family.albumDescriptionPending": "正在准备AI说明", "family.albumSave": "保存", "family.albumReaction": "发送感谢", "family.albumReactionMessage": "谢谢你分享这段回忆。", "family.albumReactionSent": "已向家人送出对这段回忆的感谢", "family.albumReactionFailed": "无法发送感谢，请再试一次。",
    "family.additionalDailyToolsTitle": "更多家庭日常工具",
    "family.additionalDailyToolsDescription": "仅在需要时打开，以减轻首次显示的负担。",
    "family.additionalDailyToolsOpen": "打开更多工具",
    "family.additionalDailyToolsClose": "关闭更多工具",
    "family.additionalDailyToolsLoading": "正在准备更多工具…",
    "family.sharingTitle": "家人关怀共享设置",
    "family.sharingDescription": "您可以随时选择要共享的内容。暂停的项目不会再显示在家人的关怀视图中。",
    "family.sharingLocation": "位置信息",
    "family.sharingLocationDetail": "用于当前位置和安全区域关怀。",
    "family.sharingHealth": "健康提示",
    "family.sharingHealthDetail": "温和地共享步数等日常提示。",
    "family.sharingCheckIn": "安心报平安",
    "family.sharingCheckInDetail": "分享您是否安好、想休息或可以聊天。",
    "family.sharingActive": "共享中",
    "family.sharingPaused": "已暂停",
    "family.sharingSaving": "正在更新共享设置…",
    "family.sharingSaved": "已更新共享设置",
    "family.sharingFailed": "无法更新共享设置，请再试一次。",
    "family.sharingGuardianSummary": "家人共享状态",
    "family.sharingGuardianDescription": "这里只显示每位家人选择共享的项目数，不显示内容本身。",
    "family.sharingSignalCount": "已共享 {count} / 3 项",
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
    "a11y.skipMain": "주요 콘텐츠로 건너뛰기",
    "a11y.routeChanged": "화면이 업데이트되었습니다. 주요 콘텐츠로 이동할 수 있습니다.",
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
    "home.loading": "불러오는 중…",
    "home.featureRipple": "인연의 물결로 가족의 지금을 느껴 보세요",
    "family.demoOpen": "3분 데모",
    "family.demoTitle": "PC 고시엔 3분 데모 가이드",
    "family.demoDescription": "실제 데이터를 바꾸지 않고 가족 안심 흐름을 짧게 소개합니다. 단계를 선택하면 관련 화면으로 이동합니다.",
    "family.demoSafetyTitle": "데모 모드 안전 안내",
    "family.demoSafetyDescription": "이 가이드는 설명 전용입니다. 가족 정보를 만들거나 보내거나 변경하지 않습니다. 실제 전송은 각 화면에서 명확히 확인합니다.",
    "family.demoStepsTitle": "3분 구성",
    "family.demoStepCreate": "가족 그룹 생성과 역할별 시작점을 소개",
    "family.demoStepSafety": "돌봄, 긴급 연락처, 대피 정보를 확인",
    "family.demoStepCheckIn": "안심 체크인과 가족의 다정한 답장을 체험",
    "family.demoStepMemory": "추억 앨범과 감사 반응을 소개",
    "family.demoStepRecovery": "통신 불안정 시 저장, 복구, 재동기화를 확인",
    "family.demoValueTitle": "심사에 전할 네 가지 가치",
    "family.demoValuePrivacy": "최소 공개 프라이버시 설계",
    "family.demoValueLanguage": "JA / EN / ZH / KO 4개 언어",
    "family.demoValueAccessibility": "고령자에게도 닿는 접근성",
    "family.demoValuePerformance": "느린 기기도 고려한 성능",
    "family.demoReset": "타임라인으로 돌아가기",
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
    "family.voicePermissionDenied": "마이크 사용이 허용되지 않았습니다",
    "family.voiceDeviceMissing": "사용할 수 있는 마이크를 찾을 수 없습니다",
    "family.voiceRecordingFailed": "녹음 또는 받아쓰기에 실패했습니다",
    "family.voiceTranscriptEmpty": "음성을 텍스트로 받지 못했습니다",
    "family.voiceRecoveryHint": "기기의 마이크 설정을 확인한 뒤 다시 시도하세요. 음성 내용은 전송되지 않았습니다.",
    "family.voiceRate": "읽어주기 속도",
    "family.voiceRateSlow": "느리게",
    "family.voiceRateStandard": "기본",
    "family.voiceRateFast": "조금 빠르게",
    "family.voiceStopSpeech": "읽어주기 중지",
    "family.voiceReviewTitle": "받아쓰기 확인",
    "family.voiceReviewDescription": "가족에게 보내기 전에 내용을 확인하고 수정할 수 있습니다. 보내기 전에는 공유되지 않습니다.",
    "family.voiceReviewConfirm": "이 내용으로 보내기",
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
    "family.chooseFeature": "볼 기능 선택",
    "family.recentFeatures": "최근 사용한 기능",
    "family.pinnedFeatures": "고정한 기능",
    "family.pinFeature": "이 기능 고정",
    "family.unpinFeature": "이 기능 고정 해제",
    "family.searchFeatures": "기능 검색",
    "family.searchFeaturesPlaceholder": "예: 사진, 안심, 일정",
    "family.noMatchingFeatures": "일치하는 기능이 없습니다",
    "family.searchResultsCount": "{count}개의 기능을 찾았습니다",
    "family.clearSearch": "검색 지우기",
    "family.recommendedFeatures": "회원님을 위한 추천 기능",
    "family.addRecommendation": "추천에 추가",
    "family.removeRecommendation": "추천에서 제거",
    "family.resetRecommendations": "추천 초기화",
    "family.shareRecommendations": "가족과 추천 공유",
    "family.safetyLauncher": "안심을 위한 빠른 접근",
    "family.safetyLauncherDescription": "안전, 건강 또는 가족 지원을 바로 열 수 있습니다",
    "family.emergencyTitle": "긴급·안심 지원",
    "family.emergencyDescription": "연락처와 대피 정보를 확인할 수 있습니다. 전화는 확인한 뒤에만 시작됩니다.",
    "family.emergencyContacts": "바로 사용할 연락처·대피 정보",
    "family.emergencyCall": "확인 후 전화",
    "family.emergencyView": "확인하기",
    "family.emergencyEvacuationSelected": "을(를) 확인하도록 선택했습니다. 주소 등의 자세한 정보는 가족 연락처 카드에서 확인할 수 있습니다.",
    "family.emergencyNoContacts": "사용할 수 있는 긴급 연락처나 대피 정보가 아직 없습니다. 보호자에게 연락처 카드 추가를 요청해 주세요.",
    "family.emergencyOfflineTitle": "통신이 불안정할 때를 위해",
    "family.emergencyOfflineDescription": "여기에 표시된 정보만 이 기기에 저장할 수 있습니다. 공유 기기에는 저장하지 마세요. 언제든지 삭제할 수 있습니다.",
    "family.emergencyOfflineReady": "오프라인 상태입니다. 이 기기에 저장된 긴급 정보를 표시합니다.",
    "family.emergencyOfflineMissing": "오프라인 상태이며 이 기기에 저장된 긴급 정보가 없습니다. 연결이 복구되면 저장할 수 있습니다.",
    "family.emergencySave": "이 기기에 저장",
    "family.emergencyRemove": "기기에서 삭제",
    "family.emergencySaved": "긴급 정보를 이 기기에 저장했습니다.",
    "family.emergencyRemoved": "이 기기에 저장된 긴급 정보를 삭제했습니다.",
    "family.emergencySavedBadge": "이 기기에 저장됨",
    "family.emergencySaveConfirmTitle": "이 기기에 긴급 정보를 저장할까요?",
    "family.emergencySaveConfirmDescription": "현재 역할에서 표시가 허용된 연락처와 대피 정보만 저장됩니다. 공유 기기에는 저장하지 마세요.",
    "family.emergencySaveConfirm": "저장",
    "family.emergencyCallConfirmTitle": "전화 시작 전 확인",
    "family.emergencyCallConfirmDescription": "{name}에게 전화를 걸려고 합니다. 긴급하지 않다면 돌아가서 상황을 먼저 확인하세요.",
    "family.emergencyCallConfirm": "전화 시작",
    "family.offlineRecoveryOfflineTitle": "오프라인으로 표시 중입니다",
    "family.offlineRecoveryOfflineDescription": "연결이 돌아올 때까지 새 공유와 업데이트는 가족에게 전송되지 않습니다.",
    "family.offlineRecoverySafetyHint": "이 기기에 저장했다면 안전 탭에서 긴급 연락처와 대피 정보를 확인할 수 있습니다.",
    "family.offlineRecoverySyncingTitle": "가족 업데이트를 안전하게 동기화 중",
    "family.offlineRecoverySyncingDescription": "대기 중인 공유를 하나씩 전송하고 있습니다. 이 화면을 닫아도 중복 전송되지 않습니다.",
    "family.offlineRecoveryPendingTitle": "전송 대기 중인 가족 공유가 있습니다",
    "family.offlineRecoveryPendingDescription": "{count}개의 가족 활동이 연결 복구를 기다리고 있습니다.",
    "family.offlineRecoveryRetry": "동기화 다시 시도",
    "family.offlineRecoveryRestoredTitle": "연결이 복구되었습니다",
    "family.offlineRecoveryRestoredDescription": "대기 중인 공유는 순서대로 동기화됩니다.",
    "family.offlineRecoveryConflictTitle": "최신 정보 확인이 필요합니다",
    "family.offlineRecoveryConflictDescription": "대기 중인 {count}개의 작업이 가족 업데이트와 겹쳐 자동 재전송을 중지했습니다.",
    "family.offlineRecoveryConflictReview": "최신 정보 확인",
    "family.performanceLowDataActive": "저데이터 모드가 켜져 있습니다. 일상 도구는 필요할 때 불러올 수 있습니다.",
    "family.performanceLowDataEnable": "저데이터 모드 사용",
    "family.performanceLowDataDisable": "기본 표시로 돌아가기",
    "family.dailyRhythm": "지금 시간에 도움이 되는 기능",
    "family.dailyRhythmMorning": "아침 준비와 가족 연결을 챙겨보세요",
    "family.dailyRhythmDaytime": "낮 동안의 안전과 컨디션을 살펴보세요",
    "family.dailyRhythmEvening": "오늘의 추억과 대화를 돌아보세요",
    "family.energyMeter": "가족 에너지 미터",
    "family.energyMeterDescription": "지금의 여유를 직접 골라 부담 없는 돌봄을 나눠보세요.",
    "family.energyLevel1": "충전이 필요해요",
    "family.energyLevel2": "천천히 가고 있어요",
    "family.energyLevel3": "괜찮아요",
    "family.energyLevel4": "기운이 있어요",
    "family.energyLevel5": "에너지가 가득해요",
    "family.energyNote": "한마디 (선택 사항)",
    "family.shareEnergy": "지금의 에너지 공유",
    "family.energyLoading": "에너지 상태를 불러오는 중…",
    "family.energyNotShared": "아직 공유하지 않음",
    "family.energyPrivacy": "의료 정보가 아니라, 오늘의 여유를 직접 선택해 전하는 미터입니다.",
    "family.widgetTitle": "지금의 가족",
    "family.widgetRealtime": "실시간",
    "family.widgetConnecting": "연결 중",
    "family.widgetReconnecting": "다시 연결 중",
    "family.widgetOffline": "업데이트 대기",
    "family.widgetLocation": "안전 돌봄",
    "family.widgetHealth": "건강",
    "family.widgetRipple": "물결과 대화",
    "family.widgetLocationEmpty": "위치를 공유하면 여기에 표시됩니다",
    "family.widgetHealthEmpty": "건강 기록 없음",
    "family.widgetRippleEmpty": "새로운 물결을 기다리는 중",
    "family.widgetRippleShared": "{name}님이 새 소식을 공유했습니다",
    "family.widgetOpenSafety": "안전과 건강 열기",
    "family.widgetOpenAssistant": "가족 AI 도우미 열기",
    "family.widgetOpenAlbum": "가족 추억 열기",
    "family.widgetSteps": "걸음",
    "family.displaySettingsTitle": "편안한 표시 설정",
    "family.displaySettingsDescription": "이 기기에서 가독성과 움직임의 정도를 선택하세요.",
    "family.displayTextSize": "글자 크기",
    "family.displaySizeStandard": "기본",
    "family.displaySizeLarge": "크게",
    "family.displaySizeXLarge": "가장 크게",
    "family.displayHighContrast": "고대비",
    "family.displayReducedMotion": "움직임 줄이기",
    "family.displayEnabled": "켜기",
    "family.displayDisabled": "끄기",
    "family.displayUpdated": "{setting}을(를) {value}(으)로 설정했습니다.",
    "family.checkInTitle": "안심 체크인",
    "family.checkInDescription": "한 번의 탭으로 “괜찮아요”를 공유하고 보호자에게 조용히 알립니다.",
    "family.checkInNote": "한마디 (선택 사항)",
    "family.checkInSubmit": "가족에게 괜찮다고 알리기",
    "family.checkInSubmitting": "가족에게 보내는 중…",
    "family.checkInShared": "가족에게 “괜찮아요”를 전했습니다",
    "family.checkInSharedAt": "{time}에 공유됨",
    "family.checkInFailed": "체크인을 보낼 수 없습니다. 다시 시도해 주세요.",
    "family.checkInRetry": "같은 내용으로 다시 보내기",
    "family.checkInRecoveryHint": "저장하지 못했습니다. 내용은 이 화면에 남아 있습니다. 연결을 확인한 뒤 다시 시도하세요.",
    "family.checkInStatusHelp": "지금의 상태 선택하기 (선택 사항)",
    "family.checkInStatusOkay": "괜찮아요",
    "family.checkInStatusRest": "조금 쉬고 싶어요",
    "family.checkInStatusAvailable": "이야기할 수 있어요",
    "family.checkInPreviewTitle": "가족에게 공유할 내용",
    "family.checkInPrivacy": "여기에 표시된 내용만 공유합니다. 작성 중인 한마디는 이 기기에 저장하지 않습니다.",
    "family.checkInFollowUpTitle": "따뜻한 한마디 보내기",
    "family.checkInFollowUpDescription": "지금 도움이 필요해 보이는 가족에게 짧고 다정한 마음을 전합니다.",
    "family.checkInFollowUpLoading": "최근 안심 체크인을 확인하고 있어요…",
    "family.checkInFollowUpTarget": "{name}님에게",
    "family.checkInFollowUpFamily": "가족",
    "family.checkInFollowUpPrivacy": "체크인에 덧붙인 선택 메모는 표시하지 않습니다. 공유된 상태만 바탕으로 답장을 보냅니다.",
    "family.checkInFollowUpNone": "지금은 답장이 필요한 체크인이 없습니다. 평소의 다정한 말도 소중해요.",
    "family.checkInFollowUpSend": "이 따뜻한 한마디 보내기",
    "family.checkInFollowUpSending": "가족에게 보내는 중…",
    "family.checkInFollowUpSent": "따뜻한 한마디를 전했어요",
    "family.checkInFollowUpFailed": "답장을 보낼 수 없습니다. 다시 시도해 주세요.",
    "family.checkInFollowUpRestGuardian": "알려줘서 고마워. 서두르지 않아도 괜찮아.",
    "family.checkInFollowUpRestChild": "알려줘서 고마워. 천천히 쉬어도 돼.",
    "family.checkInFollowUpRestElderly": "무리하지 마시고 천천히 쉬세요.",
    "family.checkInFollowUpAvailableGuardian": "이야기할 수 있다면, 지금 잠시 안부를 물어도 될까?",
    "family.checkInFollowUpAvailableChild": "지금은 조금 이야기할 수 있구나. 편할 때 연락할게.",
    "family.checkInFollowUpAvailableElderly": "이야기하실 수 있을 것 같네요. 편하실 때 안부를 여쭐게요.",
    "family.checkInHistoryTitle": "안심 체크인 단기 기록",
    "family.checkInHistoryDescription": "최근 7회의 상태와 시간만 확인할 수 있어요.",
    "family.checkInHistoryPersonalTitle": "나의 최근 체크인",
    "family.checkInHistoryEmpty": "아직 체크인이 없어요. 필요할 때 짧게 알려 주세요.",
    "family.checkInHistoryGuardianTitle": "가족의 최신 공유 상태",
    "family.checkInHistoryGuardianEmpty": "아직 공유된 체크인이 없어요.",
    "family.checkInHistoryNoSharedStatus": "공유 상태 없음",
    "family.checkInHistoryPrivacy": "선택 메모는 이 기록에 표시되지 않습니다. 공유를 일시 중지한 동안의 체크인은 가족에게 보이지 않습니다.",
    "family.careMessageTitle": "가족 돌봄 메시지함",
    "family.careMessageDescription": "짧은 마음을 남기고, 읽었는지 조용히 살펴봅니다.",
    "family.careMessageCompose": "돌봄 메시지 작성하기",
    "family.careMessageInputLabel": "따뜻한 한마디",
    "family.careMessagePlaceholder": "예: 돌아오는 길 조심해.",
    "family.careMessageRecipientLabel": "보낼 대상",
    "family.careMessageAll": "모두에게",
    "family.careMessageAllHelp": "이 메시지는 모든 가족에게 표시됩니다.",
    "family.careMessagePrivateHelp": "이 메시지는 선택한 가족에게만 표시됩니다.",
    "family.careMessageFamily": "가족",
    "family.careMessageSend": "이 메시지 남기기",
    "family.careMessageSending": "가족에게 보내는 중…",
    "family.careMessageSent": "따뜻한 한마디를 전했어요",
    "family.careMessageFailed": "메시지를 보낼 수 없습니다. 다시 시도해 주세요.",
    "family.careMessageLoading": "메시지를 불러오는 중…",
    "family.careMessageFromTo": "{sender} → {recipient}",
    "family.careMessageRead": "읽음",
    "family.careMessageUnread": "읽지 않음",
    "family.careMessageMarkRead": "눌러서 읽음으로 표시",
    "family.careMessageReadUpdated": "읽음으로 표시했어요",
    "family.careMessageReadFailed": "읽음으로 표시할 수 없습니다. 다시 시도해 주세요.",
    "family.careMessageLater": "지금은 답장하지 않음",
    "family.careMessageDefer": "나중에 확인하기",
    "family.careMessageDeferred": "나중에 확인하도록 저장했어요. 바로 답장하지 않아도 괜찮아요.",
    "family.careMessageDeferFailed": "나중 상태를 저장할 수 없습니다. 다시 시도해 주세요.",
    "family.careMessageDeferHelp": "바로 답장하지 않아도 됩니다. 준비되었을 때 확인하세요.",
    "family.careMessageEmpty": "오늘의 따뜻한 한마디를 남겨 보세요.",
    "family.dailySupportTitle": "오늘의 작은 서로 돕기",
    "family.dailySupportDescription": "장보기, 도움 요청, 완료한 일을 모아 지금 할 수 있는 일을 부드럽게 찾습니다.",
    "family.dailySupportActionGuardian": "가족 상태를 살피며 무리 없는 분담을 정리해 보세요.",
    "family.dailySupportActionChild": "할 수 있는 일 하나를 골라 가족을 조금 도와보세요.",
    "family.dailySupportActionElderly": "편안한 일만 골라도 충분합니다.",
    "family.dailySupportShopping": "장보기",
    "family.dailySupportHelp": "도움",
    "family.dailySupportCompleted": "완료",
    "family.dailySupportCheckIn": "일정 전후 안심 알리기",
    "family.dailySupportCheckInHelp": "외출, 귀가 또는 일정 전후에 짧은 체크인으로 가족을 안심시킬 수 있어요.",
    "family.albumTitle": "가족 클라우드 앨범", "family.albumDescription": "사진을 공유하면 AI가 추억을 부드럽게 정리해요.", "family.albumFavorites": "즐겨찾기", "family.albumDownloadAll": "모두 저장", "family.albumAdd": "사진 추가", "family.albumSearch": "AI 태그나 설명으로 추억 찾기", "family.albumClearSearch": "검색 지우기", "family.albumLoading": "불러오는 중…", "family.albumNoResults": "일치하는 추억을 찾지 못했어요", "family.albumNoFavorites": "아직 즐겨찾기 사진이 없어요", "family.albumEmpty": "첫 가족 사진을 추가해 보세요", "family.albumEmptyHelp": "AI가 설명과 태그를 더해 추억을 쉽게 찾도록 해요.", "family.albumUploaded": "사진을 추가하고 AI 태그를 만들었어요", "family.albumUploadFailed": "사진을 추가할 수 없어요", "family.albumFileTypeError": "JPEG, PNG 또는 WebP 이미지를 선택해 주세요", "family.albumFileSizeError": "8MB 이하의 사진을 선택해 주세요", "family.albumDownloadStarted": "{count}장의 사진 저장을 시작했어요", "family.albumAddFavorite": "즐겨찾기에 추가", "family.albumRemoveFavorite": "즐겨찾기에서 제거", "family.albumFavoriteFailed": "즐겨찾기를 업데이트할 수 없어요", "family.albumDescriptionPending": "AI 설명을 준비하고 있어요", "family.albumSave": "저장", "family.albumReaction": "고마움 보내기", "family.albumReactionMessage": "이 추억을 공유해 줘서 고마워요.", "family.albumReactionSent": "이 추억에 대한 고마움을 가족에게 전했어요", "family.albumReactionFailed": "고마움을 보낼 수 없어요. 다시 시도해 주세요.",
    "family.additionalDailyToolsTitle": "가족의 일상을 돕는 더 많은 도구",
    "family.additionalDailyToolsDescription": "필요할 때만 열어 첫 화면을 가볍게 유지합니다.",
    "family.additionalDailyToolsOpen": "추가 도구 열기",
    "family.additionalDailyToolsClose": "추가 도구 닫기",
    "family.additionalDailyToolsLoading": "추가 도구를 준비하고 있어요…",
    "family.sharingTitle": "가족 돌봄 공유 설정",
    "family.sharingDescription": "공유할 내용은 언제든 직접 선택할 수 있어요. 일시 중지한 항목은 가족 돌봄 화면에 새로 반영되지 않습니다.",
    "family.sharingLocation": "위치 정보",
    "family.sharingLocationDetail": "현재 위치와 안전 구역 돌봄에 사용합니다.",
    "family.sharingHealth": "건강 신호",
    "family.sharingHealthDetail": "걸음 수 같은 일상 신호를 부드럽게 공유합니다.",
    "family.sharingCheckIn": "안심 체크인",
    "family.sharingCheckInDetail": "괜찮은지, 쉬고 싶은지, 이야기할 수 있는지 공유합니다.",
    "family.sharingActive": "공유 중",
    "family.sharingPaused": "일시 중지",
    "family.sharingSaving": "공유 설정을 업데이트하는 중…",
    "family.sharingSaved": "공유 설정을 업데이트했어요",
    "family.sharingFailed": "공유 설정을 업데이트할 수 없습니다. 다시 시도해 주세요.",
    "family.sharingGuardianSummary": "가족 공유 상태",
    "family.sharingGuardianDescription": "내용이 아니라 각 가족이 공유를 선택한 신호 수만 표시합니다.",
    "family.sharingSignalCount": "{count} / 3개 신호 공유 중",
  },
};

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const fallbackI18nContext: I18nContextValue = {
  language: "ja",
  setLanguage: () => undefined,
  t: (key) => messages.ja[key] ?? key,
};

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
  return value ?? fallbackI18nContext;
}
