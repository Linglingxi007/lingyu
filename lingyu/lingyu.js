    (function() {
        "use strict";

        // ===== 默认数据 =====
        const DEFAULT_CARDS = [];
        const DEFAULT_EMOJIS = ['😊','🌹','🌙','✨','💕','🥺','😴','🌸','💫','🤍','🍀','🎀','🍃','🌌','🕊️'];
        // 真正的颜文字（Kaomoji）默认组 —— 之前误放了 emoji 导致"颜文字"板块内容和 emoji 重复
        const DEFAULT_KAOMOJIS = ['(´･ω･`)','(◕ᴗ◕✿)','≧∇≦','ฅ^•ﻌ•^ฅ','(๑˃̵ᴗ˂̵)و','(｡･ω･｡)','(ﾉ´ヮ`)ﾉ*: ・ﾟ✧','(^▽^)','(｡•ᴗ-)✧','(´-ω-`)','ヾ(≧▽≦*)o','(◍•ᴗ•◍)','(づ｡◕‿‿◕｡)づ','(•̀ᴗ•́)و','٩(ˊᗜˋ*)و','╰(⸝⸝⸝´꒳`⸝⸝⸝)╯','(｡･ω･｡)ﾉ♡','(｣°ﾛ°)｣','<(￣︶￣)>','(╥﹏╥)','(T_T)','┭┮﹏┭┮','(´；ω；`)','༼ つ ◕_◕ ༽つ','( ´･ω･)ﾉ( ´･ω･)ﾉ','( ˘ ³˘)♥'];
        // Emoji 符号（😣😌🌸 这类 Unicode 字符表情）
        const DEFAULT_EMOJI_SYMBOLS = ['😌','😘','🥰','😭','😤','🤗','😎','🙃','🥺','😇','🤩','😴','🤔','😏','🤤','😱','🤯','🥳','🤫','😬','🙄','😈','🤓','😽','💪','🙌','🤝','👌','✌️','🤞','💖','💜','💙','💚','💛','🧡','❤️','💘','💞','💗','✨','🌟','⭐','🌙','☀️','🌸','🌹','🌺','🌷','🌼','🌻','🍀','🍃','🌊','🌈','🎀','🎀','🎀','🍰','🧁','🍡','🍜','🍙','🍫','🍬','🍭','🍩','🍪','🎁','🎈','🎉','🎊','🏮','🎆','🎇','🧨','🔥','⚡','❄️','🌨','☁️','⛅','⛈','🌤','🌥','🌦','🌧','⛈','🌩','🌪','🌫','🌬','🌀','🌈','🌂','☂️','☔','⛱','⚡','🌡','☀️','🌤','🌥','🌦','🌧','⛈','🌩','🌪','🌫','🌬','🌀'];
        const DEFAULT_PATS = [
            "拍了拍肩膀",
            "揉了揉头发",
            "戳了戳脸颊",
            "轻轻抱了抱",
            "牵起了手",
            "靠了靠肩膀",
            "捏了捏脸",
            "拉了拉衣角"
        ];

        // ===== 字卡 / 表情 / 拍一拍 状态 =====
        let groups = { default: [...DEFAULT_CARDS] };
        let groupList = ['default'];
        let cardLibrary = [...DEFAULT_CARDS];
        let currentGroup = 'all';
        let cardSearch = '';
        let cardSelectMode = false;
        let cardSelected = new Set();

        // 默认表情原来的 emojiGroups 保存在 "颜文字" 分组（kaomojiGroups）中
        let kaomojiGroups = { default: [...DEFAULT_KAOMOJIS] };
        let kaomojiGroupList = ['default'];
        let kaoCurrentGroup = 'all';
        let kaoSearch = '';
        let kaoSelectMode = false;
        let kaoSelected = new Set();

        // Emoji 符号（😣😌🌸 这类 Unicode 字符表情）
        let emojiGroups = { default: [...DEFAULT_EMOJI_SYMBOLS] };
        let emojiGroupList = ['default'];
        let emojiCurrentGroup = 'all';
        let emojiSearch = '';
        let emojiSelectMode = false;
        let emojiSelected = new Set();

        // emoji 图片：每个分组是 [{id, url, name}]
        let emojiImgGroups = { default: [] };
        let emojiImgGroupList = ['default'];
        let emImgCurrentGroup = 'all';
        let emImgSearch = '';
        let emImgSelectMode = false;
        let emImgSelected = new Set();

        let patGroups = { default: [...DEFAULT_PATS] };
        let patGroupList = ['default'];
        let patCurrentGroup = 'all';
        let patSearch = '';
        let patSelectMode = false;
        let patSelected = new Set();
        let quickPats = []; // 梦女自设拍一拍快捷回复

        // ===== 昵称/头像 =====
        let userName = '我';
        let userAvatar = '🌸';
        let angleName = 'ta';
        let angleAvatar = '🌙';
        let avatarShape = 'circle';
        let userSize = 60, userLeft = 0, userTop = 0;
        let angleSize = 60, angleLeft = 0, angleTop = 0;

        // 聊天 / 外观 设置
        let chatReplySpeed = 300;
        let replyDelayMin = 3000;      // 回复最短等待 ms
        let replyDelayMax = 7000;       // 回复最长等待 ms
        let autoSendEnabled = true;     // 主动发送开关
        let autoSendInterval = 5;       // 主动发送间隔（分钟）
        let patDblClickEnabled = true;  // 双击头像拍一拍开关
        let patUserInterval = 500;      // 我拍间隔 ms
        let patAngleInterval = 5000;    // ta拍间隔 ms
        let patAngleReplyChance = 30;   // ta回拍概率 %
        let patLastUserTime = 0;        // 上次我拍时间
        let patLastAngleTime = 0;       // 上次ta拍时间
        let autoSendTimer = null;       // 主动发送定时器
        let chatTypingEnabled = true;   // 正在输入指示器开关
        let typingTimer = null;         // 正在输入计时器
        let chatPickMode = 'random';
        let chatShowTimestamp = true;
        let chatShowAvatar = true;
        let chatShowNickname = true;
        let chatQuoteEnabled = true;    // 引用回复
        let chatReadReceipt = true;     // 已读回执
        let chatReadStyle = 'graphic';  // 已读样式：graphic图形 / text文字
        let chatReadNoReply = true;     // 已读不回
        let chatEnterSend = false;      // 回车键发送
        let chatTimestampStyle = 'HH:MM'; // 时间戳样式
        let chatCallEnabled = true;     // 模拟通话
        let chatLetterEnabled = true;   // 主动写信
        let chatCustomReplyRule = false;
        let chatMergeCards = false;
        let chatMergeCount = 3;      // 拼字卡条数自定义：2-10，梦角从字卡库抽
        let chatEmojiMix = false;
        let chatKaomojiMix = false;
        let chatSoundMsg = false;
        let chatSoundCall = false;
        let chatVolume = 70;
        let angleCallChance = 30;       // 梦角回复开头混入称呼的概率 %（默认30%）
        // ===== 梦角状态 =====
        let angleStatuses = ['在线', '忙碌', '离线', '睡觉中', '想你中'];
        let currentAngleStatus = '在线';
        // ===== 多角色 / 群聊 =====
        let roles = [
            { id:'role_default', name:'ta', avatar:'🌙', callUser:'亲爱的', callChance:0.3, chatSnapshots:[], isGroup:false, memberIds:[], color:'#c6a8de', personalCards:[] }
        ];
        let currentRoleId = 'role_default';
        // 梦角时间戳/已读/昵称状态缓存
        // 主动写信间隔（默认最少时间单位改为分钟方便测验）
        let chatLetterMin = 15, chatLetterMinUnit = 'minute';
        let chatLetterMax = 60, chatLetterMaxUnit = 'minute';
        let letterTimer = null;      // 主动写信定时器句柄
        let replyTimer = null;       // 用户消息→梦角回复 定时器句柄
        let chatReplyMin = 10, chatReplyMinUnit = 'min';
        let chatReplyMax = 2, chatReplyMaxUnit = 'hour';
        let chatReplyMinSent = 5, chatReplyMaxSent = 20;
        // 引用内容缓存
        let quoteMsg = null;
        // 收藏与标注：梦女(usr)与梦角(angle)区分
        let favorites = { usr: [], angle: [] };   // {id, msgId, text, sender, ts, from}
        let marks = { usr: [], angle: [] };       // {id, msgId, text, sender, ts, color, note, from}
        // 撤回消息内容缓存（查看"使你撤回了什么消息"）
        let recalledCache = {};  // noticeId -> {originText, sender, ts, originalContent, recalledBy}
        // 心情日记：按日期key -> [entries按ts排序]
        // entries: {id, dateKey, ts, author: 'usr'|'angle', content, mood?: string(梦角心情)}
        let moodDiaries = {};

        // 信封：3个大板块 × 收/回信箱。每一封信: {id,parentId,title,content,from,to,ts,read,replied,sourceBox,replyTargetId?,sourceLetterBox?}
        // from/to: 'usr'|'angle'|'space'
        let letterBox = {
            mine:  { inbox: [], outbox: [] },
            angle: { inbox: [], outbox: [] },
            space: { inbox: [] }
        };
        // 留言板：梦角每日小纸条（上限5/天）。note: {id, content, ts, date, replies:[{id,content,ts,from:'usr'}]}
        // phrases：梦角话语库（内置 + 用户自定义）
        let messageBoard = { notes: [], lastDate: '', history: {}, phrases: [] };
        const DEFAULT_BOARD_PHRASES = [
            '今天有按时喝水吗？', '你爱我吗？', '今天干了什么呀？', '什么时候有空？',
            '有没有好好休息？', '今天心情怎么样？', '想你了，回来看看我好吗？',
            '记得早点睡，别熬夜。', '今天有遇到开心的事吗？', '我给你留了颗糖，甜不甜？'
        ];
        // 许愿树：梦角每日小星星（上限5/天）。star: {id, color, content, ts, date, replies:[...]}
        // 6 种颜色：yellow日常 / pink亲密 / blue求安慰 / red生气 / green恐惧 / purple担忧
        let wishTree = { stars: [], lastDate: '', history: {}, phrases: { yellow:[], pink:[], blue:[], red:[], green:[], purple:[] } };

        // ===== 游戏数据：猜拳 / 涂鸦 / 你画我猜 =====
        const DOODLE_MAX = 50;
        const DRAW_GUESS_MAX = 50;
        const DOODLE_PALETTE = ['#000000','#FFFFFF','#D9534F','#F0AD4E','#5CB85C','#5BC0DE','#428BCA','#9B59B6','#E91E63','#009688','#FF9800','#795548','#9E9E9E','#607D8B','#F8E71C','#BD10E0'];
        const DEFAULT_DRAW_TOPICS = {
            '🌱 植物':   ['向日葵','玫瑰','樱花树','仙人掌','四叶草','蘑菇','柳树','向日葵花田','竹子','含羞草','盆栽多肉','荷花','蒲公英','薰衣草','郁金香','桃花','银杏','山茶花','雏菊','木棉'],
            '🐾 动物':   ['小猫','小狗','兔子','熊猫','企鹅','金鱼','长颈鹿','大象','老虎','狐狸','仓鼠','考拉','海豚','独角兽','恐龙','猫头鹰','松鼠','螃蟹','青蛙','小乌龟'],
            '🍎 水果':   ['西瓜','苹果','草莓','葡萄','香蕉','樱桃','榴莲','芒果','水蜜桃','菠萝','蓝莓','橘子','椰子','猕猴桃','柠檬','火龙果','梨','哈密瓜','石榴','柿子'],
            '🏞 景物':   ['彩虹','城堡','摩天轮','烟花','雪山','日落','灯塔','小桥流水','森林','沙滩','热气球','星空','月亮','瀑布','小房子','故宫','富士山','金字塔','沙漠','极光'],
            '🍜 食物':   ['火锅','蛋糕','拉面','冰淇淋','寿司','烤肉','包子','奶茶','饺子','披萨','牛排','糖葫芦','麻辣烫','饭团','马卡龙','可丽饼','铜锣烧','华夫饼','烤肠','关东煮'],
            '🧸 事物':   ['书包','钢琴','雨伞','地球仪','照相机','时钟','机器人','气球','自行车','魔法棒','宝箱','吉他','风筝','镜子','茶杯','闹钟','台灯','圣诞袜','水晶球','积木']
        };
        let rpsMode = 'winner_rules';
        let rpsRole = 'dreamer';
        let dgMode = 'topic';
        let dgRole = 'dreamer';
        let dgTimer = null;
        let dreamGames = {
            rps_history: [],
            rps_stats: {dreamerWins:0, angleWins:0, ties:0},
            doodles: [],
            draw_guess_history: [],
            draw_guess_topics: {},
            draw_guess_stats: {dreamerHits:0, angleHits:0, total:0},
            wallet: {dreamer: 888.88, angle: 888.88},
            red_packet_history: []
        };
        const DEFAULT_WISH_PHRASES = {
            yellow: ['希望你多喝水。', '希望你多运动走动一下。', '记得晒晒太阳。', '今天也要好好吃饭哦。'],
            pink:  ['你陪陪我。', '你亲亲我。', '想和你吃苹果。', '想要一个拥抱。'],
            blue:  ['好累，想要你陪陪我。', '我受伤了，想要你安慰我。', '今天有点低落，抱抱我好吗？'],
            red:   ['你不可以熬夜了，要好好休息！', '不要在生理期吃冰的食物！严令禁止！', '怎么又不好好吃饭，生气了！'],
            green: ['我害怕你离开我，你不要离开我好不好？', '做了个噩梦，好怕，你在吗？', '别走远，我害怕。'],
            purple:['我看见你熬夜了，希望你好好休息。', '担心你今天太累了，歇歇吧。', '看你没回消息，有点担心你。']
        };
        // 颜色 → 图标/标签
        const WISH_COLORS = {
            yellow: { icon:'⭐', label:'日常' },
            pink:   { icon:'🌸', label:'亲密' },
            blue:   { icon:'💧', label:'求安慰' },
            red:    { icon:'🔥', label:'生气' },
            green:  { icon:'🍀', label:'恐惧' },
            purple: { icon:'🔮', label:'担忧' }
        };
        let bubbleShape = 'round';
        let bubbleCustomCSS = '';
        let customFontName = '';
        let customFontFamily = '';
        let userCallsAngle = [];
        let angleCallsUser = [];
        let bubbleUserColor = '#e8ddf2';
        let bubbleAngleColor = '#f3eef8';
        let bubbleRadius = 18;
        let bgColor = '#fcfaff';
        let bgImage = '';
        let fontSize = 14;
        let fontFamily = "'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif";
        let themeAccent = '#c6a8de';
        let seqCursor = 0; // 顺序抽取游标

        // 通话
        let callState = 'idle';
        let callTimer = null;

        // ===== DOM =====
        const chatBox = document.getElementById('chatBox');
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');

        const openSidePanelBtn = document.getElementById('openSidePanelBtn');
        const openSettingsBtn = document.getElementById('openSettingsBtn');
        const sidePanel = document.getElementById('sidePanel');
        const sideOverlay = document.getElementById('sideOverlay');
        const sideCloseBtn = document.getElementById('sideCloseBtn');

        const arrowUpBtn = document.getElementById('arrowUpBtn');
        const bottomSheet = document.getElementById('bottomSheet');
        const bottomCallBtn = document.getElementById('bottomCallBtn');
        const bottomEmojiBtn = document.getElementById('bottomEmojiBtn');
        const bottomPatBtn = document.getElementById('bottomPatBtn');

        const sideCardBtn = document.getElementById('sideCardBtn');
        const sideEmojiBtn = document.getElementById('sideEmojiBtn');
        const sidePatBtn = document.getElementById('sidePatBtn');

        // 设置主弹窗
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const settingsMainView = document.getElementById('settingsMainView');
        const appearanceView = document.getElementById('appearanceView');
        const chatSettingsView = document.getElementById('chatSettingsView');
        const dataMgmtView = document.getElementById('dataMgmtView');
        const openAppearanceBtn = document.getElementById('openAppearanceBtn');
        const openChatSettingsBtn = document.getElementById('openChatSettingsBtn');
        const openDataMgmtBtn = document.getElementById('openDataMgmtBtn');
        const backFromAppearance = document.getElementById('backFromAppearance');
        const backFromChat = document.getElementById('backFromChat');
        const backFromData = document.getElementById('backFromData');

        // 外观设置子板块按钮
        const openThemeBtn = document.getElementById('openThemeBtn');
        const openBgFontBtn = document.getElementById('openBgFontBtn');
        const openBubbleBtn = document.getElementById('openBubbleBtn');
        const openAvatarBtn = document.getElementById('openAvatarBtn');
        const openNicknameBtn = document.getElementById('openNicknameBtn');

        // 子板块弹窗
        const themeModal = document.getElementById('themeModal');
        const closeThemeModal = document.getElementById('closeThemeModal');
        const bgFontModal = document.getElementById('bgFontModal');
        const closeBgFontModal = document.getElementById('closeBgFontModal');
        const bubbleModal = document.getElementById('bubbleModal');
        const closeBubbleModal = document.getElementById('closeBubbleModal');
        const nicknameModal = document.getElementById('nicknameModal');
        const closeNicknameModal = document.getElementById('closeNicknameModal');
        const avatarModal = document.getElementById('avatarModal');
        const closeAvatarModal = document.getElementById('closeAvatarModal');
        // 收藏匣 / 标注
        const favModal = document.getElementById('favModal');
        const closeFavModal = document.getElementById('closeFavModal');
        const markModal = document.getElementById('markModal');
        const closeMarkModal = document.getElementById('closeMarkModal');
        // 底部/侧边新按钮
        const bottomFavBtn = document.getElementById('bottomFavBtn');
        const bottomMarkBtn = document.getElementById('bottomMarkBtn');
        const bottomSettingsBtn = document.getElementById('bottomSettingsBtn');
        const sideFavBtn = document.getElementById('sideFavBtn');
        const sideMarkBtn = document.getElementById('sideMarkBtn');
        const sideSettingsBtn = document.getElementById('sideSettingsBtn');

        // 昵称
        const userNameInput = document.getElementById('userNameInput');
        const angleNameInput = document.getElementById('angleNameInput');
        const saveNicknameBtn = document.getElementById('saveNicknameBtn');

        // 头像
        const userAvatarInput = document.getElementById('userAvatarInput');
        const angleAvatarInput = document.getElementById('angleAvatarInput');
        const userAvatarFile = document.getElementById('userAvatarFile');
        const angleAvatarFile = document.getElementById('angleAvatarFile');
        const userAvatarUploadBtn = document.getElementById('userAvatarUploadBtn');
        const angleAvatarUploadBtn = document.getElementById('angleAvatarUploadBtn');
        const applyUserAvatarBtn = document.getElementById('applyUserAvatarBtn');
        const applyAngleAvatarBtn = document.getElementById('applyAngleAvatarBtn');
        const removeUserAvatarBtn = document.getElementById('removeUserAvatarBtn');
        const removeAngleAvatarBtn = document.getElementById('removeAngleAvatarBtn');
        const restoreDefaultAvatarBtn = document.getElementById('restoreDefaultAvatarBtn');
        const userSizeSlider = document.getElementById('userSizeSlider');
        const userLeftSlider = document.getElementById('userLeftSlider');
        const userTopSlider = document.getElementById('userTopSlider');
        const angleSizeSlider = document.getElementById('angleSizeSlider');
        const angleLeftSlider = document.getElementById('angleLeftSlider');
        const angleTopSlider = document.getElementById('angleTopSlider');
        const userSizeValue = document.getElementById('userSizeValue');
        const userLeftValue = document.getElementById('userLeftValue');
        const userTopValue = document.getElementById('userTopValue');
        const angleSizeValue = document.getElementById('angleSizeValue');
        const angleLeftValue = document.getElementById('angleLeftValue');
        const angleTopValue = document.getElementById('angleTopValue');
        const previewUserAvatar = document.getElementById('previewUserAvatar');
        const previewAngleAvatar = document.getElementById('previewAngleAvatar');
        const previewUserEmoji = document.getElementById('previewUserEmoji');
        const previewAngleEmoji = document.getElementById('previewAngleEmoji');
        const previewUserName = document.getElementById('previewUserName');
        const previewAngleName = document.getElementById('previewAngleName');
        const saveAvatarBtn = document.getElementById('saveAvatarBtn');
        const shapeBtns = document.querySelectorAll('.shape-btn');

        // 气泡
        const bubbleShapeSelect = document.getElementById('bubbleShapeSelect');
        const bubbleUserColorInput = document.getElementById('bubbleUserColor');
        const bubbleAngleColorInput = document.getElementById('bubbleAngleColor');
        const applyBubbleUserColor = document.getElementById('applyBubbleUserColor');
        const applyBubbleAngleColor = document.getElementById('applyBubbleAngleColor');
        const bubbleRadiusSlider = document.getElementById('bubbleRadiusSlider');
        const bubbleRadiusValue = document.getElementById('bubbleRadiusValue');
        const saveBubbleBtn = document.getElementById('saveBubbleBtn');

        // 背景&字体
        const bgColorInput = document.getElementById('bgColorInput');
        const applyBgColorBtn = document.getElementById('applyBgColorBtn');
        const bgImageInput = document.getElementById('bgImageInput');
        const applyBgImageBtn = document.getElementById('applyBgImageBtn');
        const clearBgImageBtn = document.getElementById('clearBgImageBtn');
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        const saveBgFontBtn = document.getElementById('saveBgFontBtn');

        
        // ===== 主题外观 =====
        // 预设主题（每组是完整 CSS 变量集）
        const THEME_PRESETS = {
            // ☽ 月落紫樱（经典梦紫）
            zisakura: { accent:'#c6a8de', accent2:'#dcc3ed', accent_deep:'#9f79c2', accent_soft:'#efe3f7',
                bg_page:'#ece3f2', bg_card:'#ffffff', bubble_user:'#e4d2f0', bubble_angle:'#f4eef8',
                bg_chat:'#fbf7fe', bg_input:'#f5effa', text_primary:'#2d1a39', text_secondary:'#5a3d6b',
                text_muted:'#7a5b8c',
                modal_bg:'#ffffff', modal_opacity:1, modal_blur:6, overlay:'rgba(0,0,0,0.28)', overlay_color:'#000000', overlay_opacity:0.28,
                opacity_page:1, opacity_chat:1, opacity_input:1, opacity_bubble_user:1, opacity_bubble_angle:1,
                side_panel_bg:'linear-gradient(180deg, #ffffff 0%, #f7effc 50%, #f1e4f8 100%)',
                side_panel_item_bg:'rgba(198,168,222,0.10)', side_panel_item_bg_hover:'rgba(198,168,222,0.24)',
                board_bg:'linear-gradient(180deg, #fff7ee 0%, #fbeef9 100%)',
                board_note_bg:'linear-gradient(135deg, #fff0c2, #ffd8e4)',
                board_note_bg_alt:'linear-gradient(135deg, #e5efff, #f2e5ff)',
                board_detail_bg:'rgba(255,255,255,0.96)',
                wish_tree_bg:'linear-gradient(180deg, #e8f2ff 0%, #f6edff 60%, #fde7f5 100%)',
                wish_detail_bg:'rgba(255,255,255,0.96)',
                modal_header_border:'rgba(198,168,222,0.20)',
                btn_primary_bg:'linear-gradient(135deg, #e5c9f5, #bf9ee0)', btn_primary_text:'#ffffff',
                input_focus_ring:'rgba(198,168,222,0.22)', shadow_card:'rgba(120,70,160,0.12)' },
            // 🌊 夏日海盐（清透蓝绿）
            seasalt: { accent:'#6fb8c4', accent2:'#8eced6', accent_deep:'#4f98a4', accent_soft:'#e1f0f2',
                bg_page:'#e3eef0', bg_card:'#ffffff', bubble_user:'#cfe5e8', bubble_angle:'#e7f2f4',
                bg_chat:'#f6fbfc', bg_input:'#eaf4f5', text_primary:'#1a333a', text_secondary:'#436770',
                text_muted:'#708e94',
                modal_bg:'#fbfefd', modal_opacity:1, modal_blur:6, overlay:'rgba(0,0,0,0.26)', overlay_color:'#000000', overlay_opacity:0.26,
                opacity_page:1, opacity_chat:1, opacity_input:1, opacity_bubble_user:1, opacity_bubble_angle:1,
                side_panel_bg:'linear-gradient(180deg, #ffffff 0%, #f2fafb 50%, #e5f2f4 100%)',
                side_panel_item_bg:'rgba(111,184,196,0.10)', side_panel_item_bg_hover:'rgba(111,184,196,0.24)',
                board_bg:'linear-gradient(180deg, #f1faf8 0%, #eef5fb 100%)',
                board_note_bg:'linear-gradient(135deg, #d6f4e7, #c3e4f7)',
                board_note_bg_alt:'linear-gradient(135deg, #fff1d6, #cfeff3)',
                board_detail_bg:'rgba(255,255,255,0.96)',
                wish_tree_bg:'linear-gradient(180deg, #e0f5f0 0%, #e9f2fa 60%, #eef5ff 100%)',
                wish_detail_bg:'rgba(255,255,255,0.96)',
                modal_header_border:'rgba(111,184,196,0.22)',
                btn_primary_bg:'linear-gradient(135deg, #9fd5de, #6fb8c4)', btn_primary_text:'#ffffff',
                input_focus_ring:'rgba(111,184,196,0.22)', shadow_card:'rgba(50,110,130,0.10)' },
            // ☕ 焦糖摩卡（暖棕复古）
            caramel: { accent:'#c49468', accent2:'#d9b28e', accent_deep:'#9f7250', accent_soft:'#f3e6d8',
                bg_page:'#efe3d3', bg_card:'#fffaf4', bubble_user:'#ebd5b8', bubble_angle:'#f5ead8',
                bg_chat:'#fcf6ec', bg_input:'#f2e7d5', text_primary:'#3a2718', text_secondary:'#70543c',
                text_muted:'#967960',
                modal_bg:'#fffaf3', modal_opacity:1, modal_blur:6, overlay:'rgba(0,0,0,0.30)', overlay_color:'#000000', overlay_opacity:0.30,
                opacity_page:1, opacity_chat:1, opacity_input:1, opacity_bubble_user:1, opacity_bubble_angle:1,
                side_panel_bg:'linear-gradient(180deg, #fffaf3 0%, #fbf0df 50%, #f5e4cc 100%)',
                side_panel_item_bg:'rgba(196,148,104,0.10)', side_panel_item_bg_hover:'rgba(196,148,104,0.24)',
                board_bg:'linear-gradient(180deg, #fdf1dd 0%, #fae2d0 100%)',
                board_note_bg:'linear-gradient(135deg, #ffe2b8, #ffc9a0)',
                board_note_bg_alt:'linear-gradient(135deg, #fff0c2, #f5dab6)',
                board_detail_bg:'rgba(255,250,243,0.96)',
                wish_tree_bg:'linear-gradient(180deg, #fff0dd 0%, #fae4ce 60%, #f5d2b4 100%)',
                wish_detail_bg:'rgba(255,250,243,0.96)',
                modal_header_border:'rgba(196,148,104,0.24)',
                btn_primary_bg:'linear-gradient(135deg, #e0b288, #c49468)', btn_primary_text:'#ffffff',
                input_focus_ring:'rgba(196,148,104,0.24)', shadow_card:'rgba(110,70,40,0.12)' },
            // 🌲 森林薄雾（森系深绿）
            mistforest: { accent:'#7aa694', accent2:'#9cbfb0', accent_deep:'#5b8876', accent_soft:'#e4efea',
                bg_page:'#dfe8e3', bg_card:'#f6faf7', bubble_user:'#cfe0d8', bubble_angle:'#e6efe9',
                bg_chat:'#f4faf6', bg_input:'#e8f0ec', text_primary:'#1d3328', text_secondary:'#476456',
                text_muted:'#73907f',
                modal_bg:'#f6faf7', modal_opacity:1, modal_blur:6, overlay:'rgba(0,0,0,0.34)', overlay_color:'#000000', overlay_opacity:0.34,
                opacity_page:1, opacity_chat:1, opacity_input:1, opacity_bubble_user:1, opacity_bubble_angle:1,
                side_panel_bg:'linear-gradient(180deg, #f6faf7 0%, #eef5f1 50%, #e2ede7 100%)',
                side_panel_item_bg:'rgba(122,166,148,0.10)', side_panel_item_bg_hover:'rgba(122,166,148,0.24)',
                board_bg:'linear-gradient(180deg, #edf5ef 0%, #e2eee6 100%)',
                board_note_bg:'linear-gradient(135deg, #d8ecd4, #c5e3d7)',
                board_note_bg_alt:'linear-gradient(135deg, #f0e7cf, #d8ecd4)',
                board_detail_bg:'rgba(246,250,247,0.96)',
                wish_tree_bg:'linear-gradient(180deg, #e3efe4 0%, #e0eae0 60%, #dae5d2 100%)',
                wish_detail_bg:'rgba(246,250,247,0.96)',
                modal_header_border:'rgba(122,166,148,0.24)',
                btn_primary_bg:'linear-gradient(135deg, #9cbfb0, #7aa694)', btn_primary_text:'#ffffff',
                input_focus_ring:'rgba(122,166,148,0.24)', shadow_card:'rgba(60,100,75,0.12)' },
            // 🌸 樱花乳酪（粉白少女）
            sakura: { accent:'#e29bb0', accent2:'#efb8c8', accent_deep:'#c27890', accent_soft:'#fbe4ec',
                bg_page:'#f2e3ea', bg_card:'#fff9fb', bubble_user:'#ecd0da', bubble_angle:'#f7e6ed',
                bg_chat:'#fdf5f8', bg_input:'#f5e8ee', text_primary:'#3e1f2a', text_secondary:'#714356',
                text_muted:'#9a6a7e',
                modal_bg:'#fff9fb', modal_opacity:1, modal_blur:6, overlay:'rgba(0,0,0,0.26)', overlay_color:'#000000', overlay_opacity:0.26,
                opacity_page:1, opacity_chat:1, opacity_input:1, opacity_bubble_user:1, opacity_bubble_angle:1,
                side_panel_bg:'linear-gradient(180deg, #fff9fb 0%, #fbeef3 50%, #f6dce5 100%)',
                side_panel_item_bg:'rgba(226,155,176,0.10)', side_panel_item_bg_hover:'rgba(226,155,176,0.26)',
                board_bg:'linear-gradient(180deg, #fff0f4 0%, #fce4ea 100%)',
                board_note_bg:'linear-gradient(135deg, #fff0c5, #ffd1dc)',
                board_note_bg_alt:'linear-gradient(135deg, #ffe1d5, #ffd1dc)',
                board_detail_bg:'rgba(255,249,251,0.96)',
                wish_tree_bg:'linear-gradient(180deg, #fff0f4 0%, #fde0ea 60%, #ffd6d6 100%)',
                wish_detail_bg:'rgba(255,249,251,0.96)',
                modal_header_border:'rgba(226,155,176,0.22)',
                btn_primary_bg:'linear-gradient(135deg, #efb8c8, #e29bb0)', btn_primary_text:'#ffffff',
                input_focus_ring:'rgba(226,155,176,0.24)', shadow_card:'rgba(140,60,85,0.10)' },
            // ✦ 星夜琥珀（经典棕金）
            amber: { accent:'#d4a162', accent2:'#e3b97e', accent_deep:'#ae7c45', accent_soft:'#f7ead6',
                bg_page:'#efe2d1', bg_card:'#fff9ef', bubble_user:'#ebd2a8', bubble_angle:'#f5e8d1',
                bg_chat:'#fcf7ed', bg_input:'#f2e6d0', text_primary:'#3b2815', text_secondary:'#715539',
                text_muted:'#96795a',
                modal_bg:'#fff9ef', modal_opacity:1, modal_blur:6, overlay:'rgba(0,0,0,0.30)', overlay_color:'#000000', overlay_opacity:0.30,
                opacity_page:1, opacity_chat:1, opacity_input:1, opacity_bubble_user:1, opacity_bubble_angle:1,
                side_panel_bg:'linear-gradient(180deg, #fff9ef 0%, #faeed6 50%, #f5dfb6 100%)',
                side_panel_item_bg:'rgba(212,161,98,0.10)', side_panel_item_bg_hover:'rgba(212,161,98,0.26)',
                board_bg:'linear-gradient(180deg, #fdf1d7 0%, #faedc8 100%)',
                board_note_bg:'linear-gradient(135deg, #ffe8b4, #ffc992)',
                board_note_bg_alt:'linear-gradient(135deg, #fff4cf, #ffe8b4)',
                board_detail_bg:'rgba(255,249,239,0.96)',
                wish_tree_bg:'linear-gradient(180deg, #fff0d0 0%, #fae0b5 60%, #f5cb8d 100%)',
                wish_detail_bg:'rgba(255,249,239,0.96)',
                modal_header_border:'rgba(212,161,98,0.24)',
                btn_primary_bg:'linear-gradient(135deg, #e3b97e, #d4a162)', btn_primary_text:'#ffffff',
                input_focus_ring:'rgba(212,161,98,0.24)', shadow_card:'rgba(110,70,30,0.12)' }
        };

        let currentTheme = 'zisakura';
        let savedThemePresets = [];

        function applyThemeVariables(vars) {
            const root = document.documentElement;
            // 基础颜色
            if (vars.accent) root.style.setProperty('--accent', vars.accent);
            if (vars.accent2) root.style.setProperty('--accent-2', vars.accent2);
            if (vars.accent_deep) root.style.setProperty('--accent-deep', vars.accent_deep);
            if (vars.accent_soft) root.style.setProperty('--accent-soft', vars.accent_soft);
            if (vars.bg_page) root.style.setProperty('--bg-page', vars.bg_page);
            if (vars.bubble_user) root.style.setProperty('--bubble-user', vars.bubble_user);
            if (vars.bubble_angle) root.style.setProperty('--bubble-angle', vars.bubble_angle);
            if (vars.bg_chat) root.style.setProperty('--bg-chat', vars.bg_chat);
            if (vars.bg_input) root.style.setProperty('--bg-input', vars.bg_input);
            if (vars.text_primary) root.style.setProperty('--text-primary', vars.text_primary);
            if (vars.text_secondary) root.style.setProperty('--text-secondary', vars.text_secondary);
            // 弹窗
            if (vars.modal_bg) root.style.setProperty('--modal-bg', vars.modal_bg);
            if (vars.modal_opacity !== undefined) root.style.setProperty('--modal-bg-opacity', vars.modal_opacity);
            if (vars.modal_blur !== undefined) root.style.setProperty('--modal-blur', vars.modal_blur + 'px');
            // 遮罩 - 从 color + opacity 合成
            if (vars.overlay_color !== undefined && vars.overlay_opacity !== undefined) {
                const oc = vars.overlay_color || '#000000';
                const op = vars.overlay_opacity !== undefined ? vars.overlay_opacity : 0.30;
                root.style.setProperty('--modal-overlay', hexToRgba(oc, op));
            }
            // 文字 muted
            if (vars.text_muted) root.style.setProperty('--text-muted', vars.text_muted);
            // 各区域透明度
            if (vars.opacity_page !== undefined) root.style.setProperty('--opacity-page', vars.opacity_page);
            if (vars.opacity_chat !== undefined) root.style.setProperty('--opacity-chat-bg', vars.opacity_chat);
            if (vars.opacity_input !== undefined) root.style.setProperty('--opacity-input', vars.opacity_input);
            if (vars.opacity_bubble_user !== undefined) root.style.setProperty('--opacity-bubble-user', vars.opacity_bubble_user);
            if (vars.opacity_bubble_angle !== undefined) root.style.setProperty('--opacity-bubble-angle', vars.opacity_bubble_angle);
            // 背景/卡片
            if (vars.bg_card) root.style.setProperty('--bg-card', vars.bg_card);
            if (vars.bg_input) {
                const foc = vars.bg_input_focus || vars.bg_input;
                root.style.setProperty('--bg-input-focus', foc);
            }
            // 板块专属色
            if (vars.side_panel_bg) root.style.setProperty('--side-panel-bg', vars.side_panel_bg);
            if (vars.side_panel_item_bg) root.style.setProperty('--side-panel-item-bg', vars.side_panel_item_bg);
            if (vars.side_panel_item_bg_hover) root.style.setProperty('--side-panel-item-bg-hover', vars.side_panel_item_bg_hover);
            if (vars.board_bg) root.style.setProperty('--board-bg', vars.board_bg);
            if (vars.board_note_bg) root.style.setProperty('--board-note-bg', vars.board_note_bg);
            if (vars.board_note_bg_alt) root.style.setProperty('--board-note-bg-alt', vars.board_note_bg_alt);
            if (vars.board_detail_bg) root.style.setProperty('--board-detail-bg', vars.board_detail_bg);
            if (vars.wish_tree_bg) root.style.setProperty('--wish-tree-bg', vars.wish_tree_bg);
            if (vars.wish_detail_bg) root.style.setProperty('--wish-detail-bg', vars.wish_detail_bg);
            if (vars.modal_header_border) root.style.setProperty('--modal-header-border', vars.modal_header_border);
            if (vars.btn_primary_bg) root.style.setProperty('--btn-primary-bg', vars.btn_primary_bg);
            if (vars.btn_primary_text) root.style.setProperty('--btn-primary-text', vars.btn_primary_text);
            if (vars.input_focus_ring) root.style.setProperty('--input-focus-ring', vars.input_focus_ring);
            if (vars.shadow_card) root.style.setProperty('--shadow-card', vars.shadow_card);
            // 更新动态头像渐变
            if (vars.accent && vars.accent2) {
                root.style.setProperty('--avatar-bg-gradient', 'linear-gradient(135deg, ' + vars.accent2 + ', ' + vars.accent + ')');
                const av = document.getElementById('angleAvatarDisplay');
                if (av && !isImageUrl(angleAvatar)) av.style.background = 'var(--avatar-bg-gradient)';
            }
            // 同步到颜色输入
            const syncInput = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
            syncInput('themeAccentInput', vars.accent);
            syncInput('themeAccent2Input', vars.accent2);
            syncInput('themeBubbleUserInput', vars.bubble_user);
            syncInput('themeBubbleAngleInput', vars.bubble_angle);
            syncInput('themeBgChatInput', vars.bg_chat);
            syncInput('themeBgPageInput', vars.bg_page);
            syncInput('themeTextPrimaryInput', vars.text_primary);
            syncInput('themeTextSecondaryInput', vars.text_secondary);
            syncInput('themeModalBgInput', vars.modal_bg);
            syncInput('themeOverlayColorInput', vars.overlay_color);
            // 同步到透明度滑块
            const syncSlider = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) { el.value = Math.round(val * 100); } };
            syncSlider('themeModalOpacitySlider', vars.modal_opacity);
            syncSlider('themeOverlayOpacitySlider', vars.overlay_opacity);
            // blur 特殊处理
            const blurEl = document.getElementById('themeModalBlurSlider');
            if (blurEl && vars.modal_blur !== undefined) blurEl.value = vars.modal_blur;
            syncSlider('themePageOpacitySlider', vars.opacity_page);
            syncSlider('themeChatOpacitySlider', vars.opacity_chat);
            syncSlider('themeInputOpacitySlider', vars.opacity_input);
            syncSlider('themeBubbleUserOpacitySlider', vars.opacity_bubble_user);
            syncSlider('themeBubbleAngleOpacitySlider', vars.opacity_bubble_angle);
            // 更新滑块显示值
            updateAllOpacityDisplays();
        }

        function applyQuickTheme(name) {
            currentTheme = name;
            const vars = THEME_PRESETS[name];
            if (vars) {
                applyThemeVariables(vars);
                // 更新选中态
                document.querySelectorAll('#themeQuickSwatches .quick-swatch').forEach(el => {
                    el.classList.toggle('active', el.dataset.quick === name);
                });
                showToast('已切换主题');
                saveCurrentThemeToStorage();
            }
        }

        function getCurrentThemeVars() {
            const root = getComputedStyle(document.documentElement);
            const modalBgOpacity = parseFloat(root.getPropertyValue('--modal-bg-opacity').trim()) || 1;
            const modalBlur = parseFloat(root.getPropertyValue('--modal-blur').trim()) || 4;
            // Parse overlay rgba back to color + opacity
            const overlayStr = root.getPropertyValue('--modal-overlay').trim();
            let overlayColor = '#000000', overlayOpacity = 0.30;
            const rgbaMatch = overlayStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
            if (rgbaMatch) {
                overlayColor = '#' + [rgbaMatch[1], rgbaMatch[2], rgbaMatch[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
                overlayOpacity = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
            }
            return {
                accent: root.getPropertyValue('--accent').trim() || '#c6a8de',
                accent2: root.getPropertyValue('--accent-2').trim() || '#dcc3ed',
                accent_deep: root.getPropertyValue('--accent-deep').trim() || '#9f79c2',
                accent_soft: root.getPropertyValue('--accent-soft').trim() || '#efe3f7',
                bg_page: root.getPropertyValue('--bg-page').trim() || '#e8e0ee',
                bubble_user: root.getPropertyValue('--bubble-user').trim() || '#e8ddf2',
                bubble_angle: root.getPropertyValue('--bubble-angle').trim() || '#f3eef8',
                bg_chat: root.getPropertyValue('--bg-chat').trim() || '#fcfaff',
                bg_input: root.getPropertyValue('--bg-input').trim() || '#f5f0fa',
                text_primary: root.getPropertyValue('--text-primary').trim() || '#2d1a39',
                text_secondary: root.getPropertyValue('--text-secondary').trim() || '#5a3d6b',
                text_muted: root.getPropertyValue('--text-muted').trim() || '#7a5b8c',
                modal_bg: root.getPropertyValue('--modal-bg').trim() || '#ffffff',
                modal_opacity: modalBgOpacity,
                modal_blur: modalBlur,
                overlay_color: overlayColor,
                overlay_opacity: overlayOpacity,
                opacity_page: parseFloat(root.getPropertyValue('--opacity-page').trim()) || 1,
                opacity_chat: parseFloat(root.getPropertyValue('--opacity-chat-bg').trim()) || 1,
                opacity_input: parseFloat(root.getPropertyValue('--opacity-input').trim()) || 1,
                opacity_bubble_user: parseFloat(root.getPropertyValue('--opacity-bubble-user').trim()) || 1,
                opacity_bubble_angle: parseFloat(root.getPropertyValue('--opacity-bubble-angle').trim()) || 1,
                bg_card: root.getPropertyValue('--bg-card').trim() || '',
                side_panel_bg: root.getPropertyValue('--side-panel-bg').trim() || '',
                side_panel_item_bg: root.getPropertyValue('--side-panel-item-bg').trim() || '',
                side_panel_item_bg_hover: root.getPropertyValue('--side-panel-item-bg-hover').trim() || '',
                board_bg: root.getPropertyValue('--board-bg').trim() || '',
                board_note_bg: root.getPropertyValue('--board-note-bg').trim() || '',
                board_note_bg_alt: root.getPropertyValue('--board-note-bg-alt').trim() || '',
                board_detail_bg: root.getPropertyValue('--board-detail-bg').trim() || '',
                wish_tree_bg: root.getPropertyValue('--wish-tree-bg').trim() || '',
                wish_detail_bg: root.getPropertyValue('--wish-detail-bg').trim() || '',
                modal_header_border: root.getPropertyValue('--modal-header-border').trim() || '',
                btn_primary_bg: root.getPropertyValue('--btn-primary-bg').trim() || '',
                btn_primary_text: root.getPropertyValue('--btn-primary-text').trim() || '',
                input_focus_ring: root.getPropertyValue('--input-focus-ring').trim() || '',
                shadow_card: root.getPropertyValue('--shadow-card').trim() || '',
            };
        }

        function saveCurrentThemeToStorage() {
            localStorage.setItem('lingstar_current_theme', currentTheme);
            localStorage.setItem('lingstar_theme_vars', JSON.stringify(getCurrentThemeVars()));
        }

        function loadThemeFromStorage() {
            const saved = localStorage.getItem('lingstar_theme_vars');
            const savedName = localStorage.getItem('lingstar_current_theme');
            if (saved) {
                try {
                    const vars = JSON.parse(saved);
                    applyThemeVariables(vars);
                    if (savedName && THEME_PRESETS[savedName]) currentTheme = savedName;
                } catch (e) { applyThemeVariables(THEME_PRESETS.zisakura); currentTheme = 'zisakura'; }
            } else {
                applyThemeVariables(THEME_PRESETS.zisakura);
            }
            if (savedName && document.querySelectorAll('#themeQuickSwatches')) {
                document.querySelectorAll('#themeQuickSwatches .quick-swatch').forEach(el => {
                    el.classList.toggle('active', el.dataset.quick === savedName);
                });
            }
        }

        function loadSavedPresets() {
            try { savedThemePresets = JSON.parse(localStorage.getItem('lingstar_theme_presets') || '[]'); }
            catch (e) { savedThemePresets = []; }
        }

        function saveThemePreset() {
            const name = prompt('给这个主题起个名字：', savedThemePresets.length ? `方案${savedThemePresets.length+1}` : '我喜欢的梦紫');
            if (!name) return;
            const preset = { name: name, vars: getCurrentThemeVars(), savedAt: Date.now() };
            savedThemePresets.push(preset);
            localStorage.setItem('lingstar_theme_presets', JSON.stringify(savedThemePresets));
            renderThemePresets();
            showToast('主题方案已保存');
        }

        function renderThemePresets() {
            const container = document.getElementById('themePresets');
            const empty = document.getElementById('themePresetsEmpty');
            if (!savedThemePresets.length) {
                if (empty) empty.style.display = 'flex';
                if (container) container.innerHTML = '';
                return;
            }
            if (empty) empty.style.display = 'none';
            container.innerHTML = '';
            savedThemePresets.forEach((p, idx) => {
                const item = document.createElement('div');
                item.className = 'theme-preset-item';
                item.innerHTML = `
                    <div class="preset-mini-swatch" style="background:${p.vars.accent}"></div>
                    <span class="preset-name">${p.name}</span>
                    <button class="preset-del" data-idx="${idx}">删除</button>
                `;
                item.addEventListener('click', () => {
                    applyThemeVariables(p.vars);
                    showToast('已应用「' + p.name + '」');
                    // quick swatches: clear highlight since custom
                    document.querySelectorAll('#themeQuickSwatches .quick-swatch').forEach(el => el.classList.remove('active'));
                    saveCurrentThemeToStorage();
                });
                item.querySelector('.preset-del').addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    savedThemePresets.splice(idx, 1);
                    localStorage.setItem('lingstar_theme_presets', JSON.stringify(savedThemePresets));
                    renderThemePresets();
                    showToast('已删除「' + p.name + '」');
                });
                container.appendChild(item);
            });
        }

        // ===== 聊天设置（新 5-tab 结构）=====
        const chatSettingsTabs = document.getElementById('chatSettingsTabs');
        document.querySelectorAll('#chatSettingsTabs .chat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const name = tab.dataset.tab;
                document.querySelectorAll('#chatSettingsTabs .chat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.chat-tab-panel').forEach(panel => {
                    panel.style.display = panel.dataset.tab === name ? 'flex' : 'none';
                });
            });
        });

        // Timestamp option picker
        document.querySelectorAll('#chatTimestampOptions .ts-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('#chatTimestampOptions .ts-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
        // Read receipt style picker
        document.querySelectorAll('#chatReceiptStyle .style-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('#chatReceiptStyle .style-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });

        // Chat setting sliders - label formatting
        function bindSlider(id, valId, format) {
            const el = document.getElementById(id);
            const val = document.getElementById(valId);
            if (!el || !val) return;
            const update = () => { val.textContent = format(parseInt(el.value)); };
            update();
            el.addEventListener('input', update);
            el.addEventListener('change', update);
        }
        bindSlider('chatMinWaitSlider', 'chatMinWaitVal', v => (v >= 60000 ? (v/60000).toFixed(1)+'分钟' : (v/1000).toFixed(0)+'s'));
        bindSlider('chatMaxWaitSlider', 'chatMaxWaitVal', v => (v >= 60000 ? (v/60000).toFixed(1)+'分钟' : (v/1000).toFixed(0)+'s'));
        bindSlider('chatActiveIntervalSlider', 'chatActiveIntervalVal', v => v + '分钟');
        bindSlider('patUserIntervalSlider', 'patUserIntervalVal', v => (v/1000).toFixed(1)+'s');
        bindSlider('patAngleIntervalSlider', 'patAngleIntervalVal', v => (v >= 60000 ? (v/60000).toFixed(1)+'分钟' : (v/1000).toFixed(1)+'s'));
        bindSlider('patAngleReplyChanceSlider', 'patAngleReplyChanceVal', v => v + '%');

        // 聊天节奏滑块 → 实际逻辑绑定
        const chatMinWaitSliderEl = document.getElementById('chatMinWaitSlider');
        if (chatMinWaitSliderEl) chatMinWaitSliderEl.addEventListener('change', () => {
            replyDelayMin = parseInt(chatMinWaitSliderEl.value);
            saveAppearance();
        });
        const chatMaxWaitSliderEl = document.getElementById('chatMaxWaitSlider');
        if (chatMaxWaitSliderEl) chatMaxWaitSliderEl.addEventListener('change', () => {
            replyDelayMax = parseInt(chatMaxWaitSliderEl.value);
            saveAppearance();
        });
        const chatActiveMsgEl = document.getElementById('chatActiveMsg');
        if (chatActiveMsgEl) chatActiveMsgEl.addEventListener('change', () => {
            autoSendEnabled = chatActiveMsgEl.checked;
            restartAutoSendTimer();
            saveAppearance();
        });
        const chatActiveIntervalSliderEl = document.getElementById('chatActiveIntervalSlider');
        if (chatActiveIntervalSliderEl) chatActiveIntervalSliderEl.addEventListener('change', () => {
            autoSendInterval = parseInt(chatActiveIntervalSliderEl.value);
            restartAutoSendTimer();
            saveAppearance();
        });
        const patDblClickEnabledEl = document.getElementById('patDblClickEnabled');
        if (patDblClickEnabledEl) patDblClickEnabledEl.addEventListener('change', () => {
            patDblClickEnabled = patDblClickEnabledEl.checked;
            saveAppearance();
        });
        const patUserIntervalSliderEl = document.getElementById('patUserIntervalSlider');
        if (patUserIntervalSliderEl) patUserIntervalSliderEl.addEventListener('change', () => {
            patUserInterval = parseInt(patUserIntervalSliderEl.value);
            saveAppearance();
        });
        const patAngleIntervalSliderEl = document.getElementById('patAngleIntervalSlider');
        if (patAngleIntervalSliderEl) patAngleIntervalSliderEl.addEventListener('change', () => {
            patAngleInterval = parseInt(patAngleIntervalSliderEl.value);
            saveAppearance();
        });
        const patAngleReplyChanceSliderEl = document.getElementById('patAngleReplyChanceSlider');
        if (patAngleReplyChanceSliderEl) patAngleReplyChanceSliderEl.addEventListener('change', () => {
            patAngleReplyChance = parseInt(patAngleReplyChanceSliderEl.value);
            saveAppearance();
        });
        // 正在输入开关
        const chatTypingEnabledEl = document.getElementById('chatTypingEnabled');
        if (chatTypingEnabledEl) chatTypingEnabledEl.addEventListener('change', () => {
            chatTypingEnabled = chatTypingEnabledEl.checked;
            if (!chatTypingEnabled) hideTyping();
            saveAppearance();
        });

        // 拍一拍快捷面板事件
        const closePatQuickPanelBtn = document.getElementById('closePatQuickPanel');
        if (closePatQuickPanelBtn) closePatQuickPanelBtn.addEventListener('click', closePatQuickPanel);
        const manageAllPatsBtn = document.getElementById('manageAllPatsBtn');
        if (manageAllPatsBtn) manageAllPatsBtn.addEventListener('click', () => {
            closePatQuickPanel();
            renderPats();
            openModal(patModal);
        });
        // 表情包快捷预览面板
        const closeEmojiQuickPanelBtn = document.getElementById('closeEmojiQuickPanel');
        if (closeEmojiQuickPanelBtn) closeEmojiQuickPanelBtn.addEventListener('click', closeEmojiQuickPanel);
        const manageEmojiBtn = document.getElementById('manageEmojiBtn');
        if (manageEmojiBtn) manageEmojiBtn.addEventListener('click', () => {
            closeEmojiQuickPanel();
            openModal(emojiModal);
        });
        const quickPatInputEl = document.getElementById('quickPatInput');
        const sendQuickPatBtnEl = document.getElementById('sendQuickPatBtn');
        const saveQuickPatCheckEl = document.getElementById('saveQuickPatCheck');
        const saveToPatLibraryCheckEl = document.getElementById('saveToPatLibraryCheck');
        function doSendQuickPat() {
            const text = quickPatInputEl.value.trim();
            if (!text) { showToast('请输入拍一拍内容'); return; }
            // 实时查询复选框状态，避免闭包引用过期
            const saveQuick = saveQuickPatCheckEl && saveQuickPatCheckEl.checked;
            const saveToLib = saveToPatLibraryCheckEl && saveToPatLibraryCheckEl.checked;
            // 如果勾选保存到快捷回复，先加入快捷回复
            if (saveQuick) {
                if (!quickPats.includes(text)) {
                    quickPats.push(text);
                    renderQuickPatChips();
                }
            }
            // 如果勾选保存到拍一拍库，加入拍一拍库（默认分组）
            if (saveToLib) {
                if (!patGroups['default']) patGroups['default'] = [];
                if (!patGroups['default'].includes(text)) {
                    patGroups['default'].push(text);
                }
            }
            if (saveQuick || saveToLib) {
                saveAppearance();
            }
            // 发送拍一拍
            sendPat(text);
            quickPatInputEl.value = '';
            if (saveQuickPatCheckEl) saveQuickPatCheckEl.checked = false;
            if (saveToPatLibraryCheckEl) saveToPatLibraryCheckEl.checked = false;
        }
        if (sendQuickPatBtnEl) sendQuickPatBtnEl.addEventListener('click', doSendQuickPat);
        if (quickPatInputEl) quickPatInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); doSendQuickPat(); }
        });
        // chip 删除事件（事件委托）
        const quickPatChipsEl = document.getElementById('quickPatChips');
        if (quickPatChipsEl) quickPatChipsEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('del')) {
                const idx = parseInt(e.target.dataset.qpIdx);
                if (!isNaN(idx) && idx >= 0 && idx < quickPats.length) {
                    quickPats.splice(idx, 1);
                    saveAppearance();
                    renderQuickPatChips();
                }
            }
        });
        bindSlider('chatLetterMinSlider', 'chatLetterMinVal', v => {
            const unit = document.getElementById('chatLetterMinUnit');
            const u = unit ? unit.value : 'minute';
            if (u === 'minute' || u === 'min') return v + '分钟';
            if (u === 'hour') return v + '小时';
            return v + '天';
        });
        bindSlider('chatLetterMaxSlider', 'chatLetterMaxVal', v => {
            const unit = document.getElementById('chatLetterMaxUnit');
            const u = unit ? unit.value : 'minute';
            if (u === 'minute' || u === 'min') return v + '分钟';
            if (u === 'hour') return v + '小时';
            return v + '天';
        });
        bindSlider('chatReplyMinSlider', 'chatReplyMinVal', v => {
            const unit = document.getElementById('chatReplyMinUnit');
            const u = unit ? unit.value : 'min';
            return v + (u === 'min' ? '分钟' : '小时');
        });
        bindSlider('chatReplyMaxSlider', 'chatReplyMaxVal', v => {
            const unit = document.getElementById('chatReplyMaxUnit');
            const u = unit ? unit.value : 'hour';
            return v + (u === 'min' ? '分钟' : '小时');
        });
        bindSlider('chatReplyMinSent', 'chatReplyMinSentVal', v => v + '句');
        bindSlider('chatReplyMaxSent', 'chatReplyMaxSentVal', v => v + '句');
        bindSlider('chatVolumeSlider', 'chatVolumeVal', v => v + '%');

        // Sync chat settings toggles with show/hide logic
        const chatEnterSendToggle = document.getElementById('chatEnterSend');
        if (chatEnterSendToggle) {
            chatEnterSendToggle.addEventListener('change', () => {
                // Enter send toggled → affects userInput handler
                window._chatEnterSend = chatEnterSendToggle.checked;
            });
        }

        // ===== 数据管理 =====
// 数据管理
        const dataExportBtn = document.getElementById('dataExportBtn');
        const dataImportFile = document.getElementById('dataImportFile');
        const dataImportFileBtn = document.getElementById('dataImportFileBtn');
        const dataClearBtn = document.getElementById('dataClearBtn');
        const dataExportAnchor = document.getElementById('dataExportAnchor');

        // 字卡元素
        const modalCardCount = document.getElementById('modalCardCount');
        const modGroupTabs = document.getElementById('modGroupTabs');
        const modSearchInput = document.getElementById('modSearchInput');
        const modCardList = document.getElementById('modCardList');
        // 梦角状态元素
        const statusList = document.getElementById('statusList');
        const statusInput = document.getElementById('statusInput');
        const statusAddBtn = document.getElementById('statusAddBtn');
        // 单人字卡元素
        const cardTypeShared = document.getElementById('cardTypeShared');
        const cardTypePersonal = document.getElementById('cardTypePersonal');
        const personalCardsSection = document.getElementById('personalCardsSection');
        const sharedCardsSection = document.getElementById('sharedCardsSection');
        const personalCardList = document.getElementById('personalCardList');
        const personalCardInput = document.getElementById('personalCardInput');
        const personalCardAddBtn = document.getElementById('personalCardAddBtn');
        let cardViewMode = 'shared'; // 'shared' | 'personal'
        const modBatchInput = document.getElementById('modBatchInput');
        const modBatchGroupSelect = document.getElementById('modBatchGroupSelect');
        const modBatchImportBtn = document.getElementById('modBatchImportBtn');
        const modClearBatchBtn = document.getElementById('modClearBatchBtn');
        const modGroupInput = document.getElementById('modGroupInput');
        const modAddGroupBtn = document.getElementById('modAddGroupBtn');
        const modDeleteGroupBtn = document.getElementById('modDeleteGroupBtn');
        const modSelectBtn = document.getElementById('modSelectBtn');
        const modDeleteSelectedBtn = document.getElementById('modDeleteSelectedBtn');
        const modSelectInfo = document.getElementById('modSelectInfo');
        const modMoveRow = document.getElementById('modMoveRow');
        const modMoveGroupSelect = document.getElementById('modMoveGroupSelect');
        const modMoveBtn = document.getElementById('modMoveBtn');
        const modClearAllBtn = document.getElementById('modClearAllBtn');
        const modResetDefaultBtn = document.getElementById('modResetDefaultBtn');

        // 表情包元素（旧表情单页 UI 已被拆分为颜文字+emoji图片，此处兜底防止崩溃）
        const NULL_DIV = (function() {
            const d = document.createElement('div');
            try {
                // classList 无法 new DOMTokenList()，所以直接用原生真实的 element.classList（但不插入文档）
                return Object.assign(d, {
                    addEventListener: (() => {}),
                    querySelectorAll: () => [],
                    querySelector: () => null,
                    getElementsByTagName: () => [],
                    removeChild: () => {},
                    appendChild: () => {},
                    insertBefore: () => {},
                    dataset: {},
                    value: '',
                    checked: false,
                    innerText: '',
                    files: null
                });
            } catch(e) { return d; }
        })();
        function _gE(el) { return el || NULL_DIV; }
        const emojiList = _gE(document.getElementById('emojiList'));
        const emojiSearchInput = _gE(document.getElementById('emojiSearchInput'));
        const emojiInput = _gE(document.getElementById('emojiInput'));
        const emojiGroupSelect = _gE(document.getElementById('emojiGroupSelect'));
        const addEmojiBtn = _gE(document.getElementById('addEmojiBtn'));
        const clearEmojiBtn = _gE(document.getElementById('clearEmojiBtn'));
        const resetEmojiBtn = _gE(document.getElementById('resetEmojiBtn'));
        const emojiGroupTabs = _gE(document.getElementById('emojiGroupTabs'));
        const emojiSelectBtn = _gE(document.getElementById('emojiSelectBtn'));
        const emojiDeleteSelectedBtn = _gE(document.getElementById('emojiDeleteSelectedBtn'));
        const emojiSelectInfo = _gE(document.getElementById('emojiSelectInfo'));
        const emojiMoveRow = _gE(document.getElementById('emojiMoveRow'));
        const emojiMoveGroupSelect = _gE(document.getElementById('emojiMoveGroupSelect'));
        const emojiMoveBtn = _gE(document.getElementById('emojiMoveBtn'));
        const emojiCount = _gE(document.getElementById('emojiCount'));
        const emojiAllCount = _gE(document.getElementById('emojiAllCount'));
        const emojiBatchInput = _gE(document.getElementById('emojiBatchInput'));
        const emojiBatchGroupSelect = _gE(document.getElementById('emojiBatchGroupSelect'));
        const emojiBatchImportBtn = _gE(document.getElementById('emojiBatchImportBtn'));
        const emojiClearBatchBtn = _gE(document.getElementById('emojiClearBatchBtn'));
        const emojiGroupInput = _gE(document.getElementById('emojiGroupInput'));
        const emojiAddGroupBtn = _gE(document.getElementById('emojiAddGroupBtn'));
        const emojiDeleteGroupBtn = _gE(document.getElementById('emojiDeleteGroupBtn'));
        // 是否旧表情单页 UI 实际存在（不存在时 renderEmojis 直接跳过）
        const legacyEmojiUIExists = !!document.getElementById('emojiGroupTabs');

        // 拍一拍元素
        const patList = document.getElementById('patList');
        const patSearchInput = document.getElementById('patSearchInput');
        const patInput = document.getElementById('patInput');
        const patGroupSelect = document.getElementById('patGroupSelect');
        const addPatBtn = document.getElementById('addPatBtn');
        const clearPatBtn = document.getElementById('clearPatBtn');
        const resetPatBtn = document.getElementById('resetPatBtn');
        const patGroupTabs = document.getElementById('patGroupTabs');
        const patSelectBtn = document.getElementById('patSelectBtn');
        const patDeleteSelectedBtn = document.getElementById('patDeleteSelectedBtn');
        const patSelectInfo = document.getElementById('patSelectInfo');
        const patMoveRow = document.getElementById('patMoveRow');
        const patMoveGroupSelect = document.getElementById('patMoveGroupSelect');
        const patMoveBtn = document.getElementById('patMoveBtn');
        const patCount = document.getElementById('patCount');
        const patAllCount = document.getElementById('patAllCount');
        const patBatchInput = document.getElementById('patBatchInput');
        const patBatchGroupSelect = document.getElementById('patBatchGroupSelect');
        const patBatchImportBtn = document.getElementById('patBatchImportBtn');
        const patClearBatchBtn = document.getElementById('patClearBatchBtn');
        const patGroupInput = document.getElementById('patGroupInput');
        const patAddGroupBtn = document.getElementById('patAddGroupBtn');
        const patDeleteGroupBtn = document.getElementById('patDeleteGroupBtn');

        // 通话元素
        const callModal = document.getElementById('callModal');
        const closeCallModal = document.getElementById('closeCallModal');
        const callBtn = document.getElementById('callBtn');
        const hangupBtn = document.getElementById('hangupBtn');
        const callStatusText = document.getElementById('callStatusText');
        const callDreamerDot = document.getElementById('callDreamerDot');
        const callAngleDot = document.getElementById('callAngleDot');
        const callUserAvatar = document.getElementById('callUserAvatar');
        const callAngleAvatar = document.getElementById('callAngleAvatar');
        const callUserName = document.getElementById('callUserName');
        const callAngleName = document.getElementById('callAngleName');

        // ===== 工具 =====
        function showToast(msg) { alert(msg); }

        function isImageUrl(str) {
            return str && (str.startsWith('http') || str.startsWith('data:image'));
        }

        // 按选择的样式格式化时间戳
        function formatDateCN(ts) {
            const d = new Date(ts);
            return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
        }
        function formatTimeHMS(ts) {
            const d = new Date(ts);
            const pad = n => String(n).padStart(2, '0');
            return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
        function formatDateKey(ts) {
            const d = new Date(ts);
            const pad = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        }
        function formatTimestamp(d, style) {
            const h24 = d.getHours();
            const m = d.getMinutes();
            const s = d.getSeconds();
            const pad = n => String(n).padStart(2, '0');
            switch (style) {
                case 'HH:MM:SS': return `${pad(h24)}:${pad(m)}:${pad(s)}`;
                case 'H:MM PM': {
                    const ampm = h24 >= 12 ? 'PM' : 'AM';
                    const h12 = h24 % 12 || 12;
                    return `${h12}:${pad(m)} ${ampm}`;
                }
                case 'H:MM:SS PM': {
                    const ampm = h24 >= 12 ? 'PM' : 'AM';
                    const h12 = h24 % 12 || 12;
                    return `${h12}:${pad(m)}:${pad(s)} ${ampm}`;
                }
                default: return `${pad(h24)}:${pad(m)}`;
            }
        }
        let _msgIdCounter = 0;
        function addChatMessage(text, type = 'system', opts = {}) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${type}`;
            _msgIdCounter++;
            const mid = 'msg-' + _msgIdCounter + '-' + Date.now().toString(36);
            msgDiv.dataset.msgId = mid;
            const senderKey = type === 'user' ? 'usr' : 'angle';
            msgDiv.dataset.sender = senderKey;

            // ============ 开关：chatShowAvatar 为 true 时才渲染头像（头像在气泡外） ============
            if (chatShowAvatar) {
                const avatarSpan = document.createElement('span');
                avatarSpan.className = 'msg-avatar';
                if (type === 'user') {
                    avatarSpan.innerHTML = isImageUrl(userAvatar) ? `<img src="${userAvatar}">` : userAvatar;
                } else {
                    avatarSpan.innerHTML = isImageUrl(angleAvatar) ? `<img src="${angleAvatar}">` : angleAvatar;
                }
                msgDiv.appendChild(avatarSpan);
            }

            // body容器：content → quote → meta 垂直包裹在 msg-bubble（气泡）内
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'msg-bubble';

            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'msg-body';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'msg-content';
            contentDiv.innerHTML = text.replace(/\n/g, '<br>');
            if (opts.markColor) {
                contentDiv.style.background = opts.markColor;
                contentDiv.style.borderRadius = '14px';
                contentDiv.style.padding = '6px 10px';
            }
            bodyDiv.appendChild(contentDiv);

            // 引用区（在消息内容下方）
            if (opts.quote) {
                const q = document.createElement('div');
                q.className = 'msg-quote';
                const qLabel = opts.quote.sender === 'usr' ? userName : angleName;
                const safe = (opts.quote.text || '').replace(/\n/g, ' ').slice(0, 80);
                q.innerHTML = `<span class="q-label">${qLabel}：</span><span class="q-text">${safe}</span>`;
                bodyDiv.appendChild(q);
            }

            // 时间戳 + 昵称 + 已读回执（用户消息先显示未读 ✓ / 未读 ，1.5–5s 随机延迟后变 ✓✓ / 已读）
            const metaDiv = document.createElement('div');
            metaDiv.className = 'msg-meta';
            const now = opts.ts ? new Date(opts.ts) : new Date();
            const tsStr = formatTimestamp(now, chatTimestampStyle);
            const senderName = type === 'user' ? userName : angleName;
            const whoSpan = chatShowNickname ? `<span class="msg-who">${senderName}</span> · ` : '';
            let readHtml = '';
            const readElId = mid + '-read';
            if (chatReadReceipt && type === 'user') {
                if (chatReadStyle === 'text') {
                    readHtml = ` · <span class="msg-read-text" id="${readElId}">未读</span>`;
                } else {
                    readHtml = ` <span class="msg-read-graphic" id="${readElId}" style="color:#a999c5;font-weight:700;">✓</span>`;
                }
            }
            metaDiv.innerHTML = `<small>${whoSpan}${tsStr}${readHtml}</small>`;
            bodyDiv.appendChild(metaDiv);

            bubbleDiv.appendChild(bodyDiv);
            msgDiv.appendChild(bubbleDiv);

            // 收藏标记（挂在气泡外层）
            if (opts.fav) {
                const star = document.createElement('span');
                star.className = 'msg-fav-star';
                star.textContent = '⭐';
                bubbleDiv.appendChild(star);
            }

            // ============ 交互：点击消息什么都不做；长按 (450ms) / 右键 (桌面端回退) → 弹出悬浮工具栏 —— 全部通过 init() 里 chatBox 的委托事件监听，避免 IIFE 内 openMsgToolbar 函数作用域问题 ============

            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;

            // ============ 多角色：存消息快照到当前角色 ============
            try {
                var cur = getCurrentRole();
                if (cur) {
                    if (!cur.chatSnapshots) cur.chatSnapshots = [];
                    cur.chatSnapshots.push(msgDiv.outerHTML);
                    if (cur.chatSnapshots.length > 500) cur.chatSnapshots.shift();
                }
            } catch(e) {}

            // ============ 已读回执：随机 1.5–5s 延迟再变已读（避免用户一发消息就秒已读）============
            if (chatReadReceipt && type === 'user') {
                const delay = 1500 + Math.floor(Math.random() * 3500);
                setTimeout(() => {
                    const el = document.getElementById(readElId);
                    if (!el) return;
                    if (chatReadStyle === 'text') {
                        el.textContent = '已读';
                        el.style.color = '#b496ff';
                    } else {
                        el.textContent = '✓✓';
                        el.style.color = '#b496ff';
                    }
                }, delay);
            }

            // ============ 消息提示音：梦角消息发出时 playSfx('msg') ============
            if (chatSoundMsg && (type === 'angle' || (type === 'system' && senderKey === 'angle'))) {
                playSfx('msg');
            }

            return { id: mid, div: msgDiv };
        }

        function renderAvatar(container, avatar, shape, size, left, top) {
            container.style.width = size + 'px';
            container.style.height = size + 'px';
            container.style.marginLeft = left + 'px';
            container.style.marginTop = top + 'px';
            container.className = `avatar-preview shape-${shape}`;
            if (isImageUrl(avatar)) {
                container.innerHTML = `<img src="${avatar}">`;
            } else {
                container.innerHTML = `<span style="font-size:${size*0.6}px;">${avatar}</span>`;
            }
        }

        // ===== 弹窗控制 =====
        function openModal(modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeModal(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        // 子板块弹窗：保留设置弹窗在底层，子弹窗覆盖其上
        function openSubModal(modal) {
            openModal(modal);
        }

        // ===== 侧边栏控制 =====
        function openSidePanel() {
            sidePanel.classList.add('open');
            sideOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeSidePanel() {
            sidePanel.classList.remove('open');
            sideOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // ===== 底部上弹侧边栏 =====
        let bottomSheetOpen = false;
        function toggleBottomSheet() {
            bottomSheetOpen = !bottomSheetOpen;
            bottomSheet.classList.toggle('open', bottomSheetOpen);
            arrowUpBtn.classList.toggle('active', bottomSheetOpen);
            const overlay = document.getElementById('bottomSheetOverlay');
            if (overlay) overlay.classList.toggle('active', bottomSheetOpen);
        }
        function closeBottomSheet() {
            bottomSheetOpen = false;
            bottomSheet.classList.remove('open');
            arrowUpBtn.classList.remove('active');
            const overlay = document.getElementById('bottomSheetOverlay');
            if (overlay) overlay.classList.remove('active');
        }
        // 点击遮罩 / ESC 关闭折叠栏
        setTimeout(function(){
            const overlay = document.getElementById('bottomSheetOverlay');
            if (overlay) overlay.addEventListener('click', closeBottomSheet);
        }, 0);

        // ===== 设置三大板块导航 =====
        function showSettingsView(view) {
            settingsMainView.style.display = 'none';
            appearanceView.style.display = 'none';
            chatSettingsView.style.display = 'none';
            dataMgmtView.style.display = 'none';
            if (view) view.style.display = 'flex';
            else settingsMainView.style.display = 'flex';
        }

        // ===== 昵称/头像管理 =====
        function loadProfile() {
            const saved = localStorage.getItem('dream_profile');
            if (saved) {
                try {
                    const p = JSON.parse(saved);
                    userName = p.userName || '我';
                    userAvatar = p.userAvatar || '🌸';
                    angleName = p.angleName || 'ta';
                    angleAvatar = p.angleAvatar || '🌙';
                    avatarShape = p.avatarShape || 'circle';
                    userSize = p.userSize || 60;
                    userLeft = p.userLeft || 0;
                    userTop = p.userTop || 0;
                    angleSize = p.angleSize || 60;
                    angleLeft = p.angleLeft || 0;
                    angleTop = p.angleTop || 0;
                } catch (e) {}
            }
            applyProfile();
        }

        function applyProfile() {
            document.getElementById('angleNameDisplay').textContent = angleName;
            document.getElementById('angleStatusDisplay').textContent = '· ' + currentAngleStatus;
            const avatarEl = document.getElementById('angleAvatarDisplay');
            if (isImageUrl(angleAvatar)) {
                avatarEl.innerHTML = `<img src="${angleAvatar}">`;
                avatarEl.style.background = 'none';
            } else {
                avatarEl.textContent = angleAvatar;
                avatarEl.style.background = 'linear-gradient(135deg, #dcc3ed, #c6a8de)';
            }
            // 梦女头像（顶栏）
            const dreamerAv = document.getElementById('dreamerAvatarDisplay');
            if (dreamerAv) {
                if (isImageUrl(userAvatar)) {
                    dreamerAv.innerHTML = `<img src="${userAvatar}">`;
                    dreamerAv.style.background = 'none';
                } else {
                    dreamerAv.textContent = userAvatar;
                    dreamerAv.style.background = 'linear-gradient(135deg, #ffd1dc, #ffb3c6)';
                }
            }
            if (userNameInput) userNameInput.value = userName;
            if (angleNameInput) angleNameInput.value = angleName;
            if (userAvatarInput) userAvatarInput.value = userAvatar;
            if (angleAvatarInput) angleAvatarInput.value = angleAvatar;

            renderAvatar(previewUserAvatar, userAvatar, avatarShape, userSize, userLeft, userTop);
            renderAvatar(previewAngleAvatar, angleAvatar, avatarShape, angleSize, angleLeft, angleTop);
            previewUserName.textContent = userName;
            previewAngleName.textContent = angleName;

            if (userSizeSlider) userSizeSlider.value = userSize;
            if (userLeftSlider) userLeftSlider.value = userLeft;
            if (userTopSlider) userTopSlider.value = userTop;
            if (angleSizeSlider) angleSizeSlider.value = angleSize;
            if (angleLeftSlider) angleLeftSlider.value = angleLeft;
            if (angleTopSlider) angleTopSlider.value = angleTop;
            if (userSizeValue) userSizeValue.textContent = userSize + 'px';
            if (userLeftValue) userLeftValue.textContent = userLeft + 'px';
            if (userTopValue) userTopValue.textContent = userTop + 'px';
            if (angleSizeValue) angleSizeValue.textContent = angleSize + 'px';
            if (angleLeftValue) angleLeftValue.textContent = angleLeft + 'px';
            if (angleTopValue) angleTopValue.textContent = angleTop + 'px';

            if (callUserAvatar) callUserAvatar.textContent = userAvatar;
            if (callAngleAvatar) callAngleAvatar.textContent = angleAvatar;
            if (callUserName) callUserName.textContent = userName;
            if (callAngleName) callAngleName.textContent = angleName;

            shapeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.shape === avatarShape);
            });
        }

        function saveFullProfile() {
            const data = {
                userName, userAvatar, angleName, angleAvatar, avatarShape,
                userSize, userLeft, userTop, angleSize, angleLeft, angleTop
            };
            localStorage.setItem('dream_profile', JSON.stringify(data));
            applyProfile();
            showToast('已保存');
        }

        // ===== 梦角状态管理 =====
        function renderStatuses() {
            if (!statusList) return;
            statusList.innerHTML = '';
            angleStatuses.forEach(function(s) {
                const chip = document.createElement('span');
                const isActive = s === currentAngleStatus;
                chip.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;font-size:0.72rem;cursor:pointer;transition:all 0.2s;' +
                    (isActive ? 'background:var(--accent);color:#fff;' : 'background:var(--bg-surface);color:var(--text_primary);border:1px solid var(--border);');
                chip.textContent = s;
                chip.onclick = function() {
                    selectStatus(s);
                };
                // 删除按钮
                const del = document.createElement('span');
                del.textContent = '×';
                del.style.cssText = 'margin-left:2px;opacity:' + (isActive ? '0.5' : '0.7') + ';font-weight:bold;';
                del.onclick = function(e) {
                    e.stopPropagation();
                    deleteStatus(s);
                };
                chip.appendChild(del);
                statusList.appendChild(chip);
            });
        }
        function selectStatus(s) {
            currentAngleStatus = s;
            applyProfile();
            saveAppearance();
            renderStatuses();
            showToast('状态已切换为「' + s + '」');
        }
        function addStatus() {
            const val = statusInput.value.trim();
            if (!val) { showToast('请输入状态内容'); return; }
            if (val.length > 10) { showToast('状态最多 10 个字'); return; }
            if (angleStatuses.indexOf(val) >= 0) { showToast('该状态已存在'); return; }
            angleStatuses.push(val);
            statusInput.value = '';
            saveAppearance();
            renderStatuses();
            showToast('已添加状态「' + val + '」');
        }
        function deleteStatus(s) {
            const idx = angleStatuses.indexOf(s);
            if (idx < 0) return;
            if (angleStatuses.length <= 1) { showToast('至少保留一个状态'); return; }
            angleStatuses.splice(idx, 1);
            // 如果删除的是当前状态，切换到第一个
            if (currentAngleStatus === s) {
                currentAngleStatus = angleStatuses[0];
                applyProfile();
            }
            saveAppearance();
            renderStatuses();
            showToast('已删除状态「' + s + '」');
        }

        // ===== 字卡库：通用字卡(groups) + 当前角色单人字卡 =====
        function rebuildCardLibrary() {
            cardLibrary = [];
            for (const g in groups) cardLibrary = cardLibrary.concat(groups[g]);
            const cur = getCurrentRole();
            if (cur && Array.isArray(cur.personalCards)) {
                cardLibrary = cardLibrary.concat(cur.personalCards);
            }
        }
        function switchCardView(mode) {
            cardViewMode = mode;
            if (mode === 'personal') {
                personalCardsSection.style.display = '';
                sharedCardsSection.style.display = 'none';
                cardTypePersonal.className = 'btn btn-primary-mod';
                cardTypeShared.className = 'btn';
                renderPersonalCards();
            } else {
                personalCardsSection.style.display = 'none';
                sharedCardsSection.style.display = '';
                cardTypeShared.className = 'btn btn-primary-mod';
                cardTypePersonal.className = 'btn';
                renderCards();
            }
        }
        function renderPersonalCards() {
            const cur = getCurrentRole();
            const list = cur && cur.personalCards ? cur.personalCards : [];
            if (!personalCardList) return;
            personalCardList.innerHTML = '';
            if (!list.length) {
                personalCardList.innerHTML = '<div style="text-align:center; color:var(--text_tertiary); font-size:0.7rem; padding:20px;">暂无单人字卡</div>';
                return;
            }
            list.forEach(function(card, idx) {
                const item = document.createElement('div');
                item.className = 'mod-list-item';
                item.innerHTML = '<span class="mod-card-text" style="flex:1;"></span><button class="mod-card-delete">✕</button>';
                item.querySelector('.mod-card-text').textContent = card;
                item.querySelector('.mod-card-delete').onclick = function() { deletePersonalCard(idx); };
                personalCardList.appendChild(item);
            });
        }
        function addPersonalCard() {
            const val = (personalCardInput.value || '').trim();
            if (!val) { showToast('请输入字卡内容'); return; }
            const cur = getCurrentRole();
            if (!cur) return;
            if (cur.personalCards.indexOf(val) >= 0) { showToast('该字卡已存在'); return; }
            cur.personalCards.push(val);
            personalCardInput.value = '';
            rebuildCardLibrary();
            saveAppearance();
            renderPersonalCards();
            showToast('已添加到单人字卡');
        }
        function deletePersonalCard(idx) {
            const cur = getCurrentRole();
            if (!cur || !cur.personalCards[idx]) return;
            cur.personalCards.splice(idx, 1);
            rebuildCardLibrary();
            saveAppearance();
            renderPersonalCards();
            showToast('已删除单人字卡');
        }

        // ===== 字卡渲染 =====
        function renderCards() {
            modGroupTabs.innerHTML = '';
            let total = 0;
            for (const g in groups) total += groups[g].length;

            const allTab = document.createElement('span');
            allTab.className = `mod-group-tab ${currentGroup === 'all' ? 'active' : ''}`;
            allTab.dataset.group = 'all';
            allTab.innerHTML = `全部 <span class="count">${total}</span>`;
            allTab.addEventListener('click', () => switchGroup('all'));
            modGroupTabs.appendChild(allTab);

            for (const gName of groupList) {
                if (gName === 'default') continue;
                const tab = document.createElement('span');
                tab.className = `mod-group-tab ${currentGroup === gName ? 'active' : ''}`;
                tab.dataset.group = gName;
                const count = groups[gName] ? groups[gName].length : 0;
                tab.innerHTML = `${gName} <span class="count">${count}</span>`;
                tab.addEventListener('click', () => switchGroup(gName));
                modGroupTabs.appendChild(tab);
            }

            modBatchGroupSelect.innerHTML = '';
            for (const g of groupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                modBatchGroupSelect.appendChild(opt);
            }
            const modJsonGroupSelect = document.getElementById('modJsonGroupSelect');
            if (modJsonGroupSelect) {
                modJsonGroupSelect.innerHTML = '';
                for (const g of groupList) {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g === 'default' ? '默认' : g;
                    modJsonGroupSelect.appendChild(opt);
                }
            }
            modMoveGroupSelect.innerHTML = '<option value="">移动到...</option>';
            for (const g of groupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                modMoveGroupSelect.appendChild(opt);
            }

            let display = [];
            if (currentGroup === 'all') {
                for (const g in groups) display = display.concat(groups[g]);
            } else if (groups[currentGroup]) {
                display = groups[currentGroup];
            } else {
                currentGroup = 'all';
                for (const g in groups) display = display.concat(groups[g]);
            }

            const kw = cardSearch.trim().toLowerCase();
            if (kw) display = display.filter(c => c.toLowerCase().includes(kw));

            modCardList.innerHTML = '';
            if (!display.length) {
                const empty = document.createElement('span');
                empty.className = 'mod-empty';
                empty.textContent = kw ? '未找到匹配字卡' : (currentGroup === 'all' ? '暂无字卡' : `「${currentGroup}」为空`);
                modCardList.appendChild(empty);
            } else {
                display.forEach(card => {
                    const realIdx = cardLibrary.indexOf(card);
                    let gName = '';
                    for (const g in groups) {
                        if (groups[g].includes(card)) { gName = g; break; }
                    }
                    const item = document.createElement('span');
                    item.className = 'mod-item';
                    if (cardSelectMode && cardSelected.has(realIdx)) item.classList.add('selected');
                    const label = gName !== 'default' ? `<span class="group-label">${gName}</span>` : '';
                    item.innerHTML = `${card} ${label} <span class="del" data-idx="${realIdx}">✕</span>`;
                    if (cardSelectMode) {
                        item.style.cursor = 'pointer';
                        item.addEventListener('click', function(e) {
                            if (e.target.classList.contains('del')) return;
                            const idx = parseInt(this.querySelector('.del').dataset.idx);
                            toggleCardSelect(idx);
                        });
                    }
                    modCardList.appendChild(item);
                });
                modCardList.querySelectorAll('.del').forEach(el => {
                    el.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const idx = parseInt(this.dataset.idx);
                        if (!isNaN(idx) && idx >= 0 && idx < cardLibrary.length) {
                            const text = cardLibrary[idx];
                            for (const g in groups) {
                                const pos = groups[g].indexOf(text);
                                if (pos !== -1) groups[g].splice(pos, 1);
                            }
                            cardLibrary.splice(idx, 1);
                            cardSelected.clear();
                            renderCards();
                            showToast('已删除一张字卡');
                        }
                    });
                });
            }

            modalCardCount.textContent = `${cardLibrary.length} 张`;
            const allCount = document.getElementById('modAllCount');
            if (allCount) allCount.textContent = total;
            updateCardSelectUI();
        }

        function switchGroup(name) {
            if (name !== 'all' && !groups[name]) name = 'all';
            currentGroup = name;
            cardSelected.clear();
            renderCards();
        }
        function toggleCardSelect(idx) {
            if (cardSelected.has(idx)) cardSelected.delete(idx);
            else cardSelected.add(idx);
            renderCards();
        }
        function updateCardSelectUI() {
            const count = cardSelected.size;
            modSelectInfo.textContent = `已选 ${count}`;
            if (count > 0) {
                modDeleteSelectedBtn.style.display = 'inline-flex';
                modDeleteSelectedBtn.textContent = `删除选中(${count})`;
                modMoveRow.style.display = 'flex';
            } else {
                modDeleteSelectedBtn.style.display = 'none';
                modMoveRow.style.display = 'none';
            }
        }
        function toggleCardSelectMode() {
            cardSelectMode = !cardSelectMode;
            if (!cardSelectMode) { cardSelected.clear(); modSelectBtn.textContent = '☑ 选择'; }
            else { modSelectBtn.textContent = '✕ 取消'; }
            renderCards();
        }
        function deleteCardSelected() {
            if (!cardSelected.size) return;
            if (!confirm(`删除选中的 ${cardSelected.size} 张字卡？`)) return;
            const sorted = Array.from(cardSelected).sort((a, b) => b - a);
            for (const idx of sorted) {
                const text = cardLibrary[idx];
                for (const g in groups) {
                    const pos = groups[g].indexOf(text);
                    if (pos !== -1) groups[g].splice(pos, 1);
                }
                cardLibrary.splice(idx, 1);
            }
            cardSelected.clear();
            cardSelectMode = false;
            modSelectBtn.textContent = '☑ 选择';
            renderCards();
            showToast(`已删除 ${sorted.length} 张字卡`);
        }
        function moveCardSelected() {
            if (!cardSelected.size) { alert('请先选择字卡'); return; }
            const target = modMoveGroupSelect.value;
            if (!target || !groups[target]) { alert('请选择目标分组'); return; }
            const count = cardSelected.size;
            const cards = [];
            const sorted = Array.from(cardSelected).sort((a, b) => b - a);
            for (const idx of sorted) cards.push(cardLibrary[idx]);
            for (const card of cards) {
                for (const g in groups) {
                    const pos = groups[g].indexOf(card);
                    if (pos !== -1) { groups[g].splice(pos, 1); break; }
                }
                const pos = cardLibrary.indexOf(card);
                if (pos !== -1) cardLibrary.splice(pos, 1);
            }
            groups[target] = groups[target].concat(cards);
            const seen = new Set();
            groups[target] = groups[target].filter(c => { if (seen.has(c)) return false; seen.add(c); return true; });
            rebuildCardLibrary();
            cardSelected.clear();
            cardSelectMode = false;
            modSelectBtn.textContent = '☑ 选择';
            renderCards();
            showToast(`移动 ${count} 张字卡到「${target === 'default' ? '默认' : target}」`);
        }
        function addCardGroup() {
            const name = modGroupInput.value.trim();
            if (!name) { alert('请输入分组名称'); return; }
            if (name === 'all' || name === 'default') { alert('不能使用 "all" 或 "default"'); return; }
            if (groups[name]) { alert(`「${name}」已存在`); return; }
            groups[name] = [];
            groupList.push(name);
            modGroupInput.value = '';
            renderCards();
            showToast(`创建分组「${name}」`);
        }
        function deleteCardGroup() {
            if (groupList.length <= 1) { alert('至少保留一个分组'); return; }
            const name = prompt('输入要删除的分组名（字卡移至"默认"）：');
            if (!name) return;
            if (name === 'default') { alert('不能删除默认分组'); return; }
            if (!groups[name]) { alert(`「${name}」不存在`); return; }
            if (!confirm(`删除「${name}」？${groups[name].length} 张字卡移至"默认"`)) return;
            if (groups[name].length) {
                groups['default'] = groups['default'].concat(groups[name]);
                const seen = new Set();
                groups['default'] = groups['default'].filter(c => { if (seen.has(c)) return false; seen.add(c); return true; });
                rebuildCardLibrary();
            }
            delete groups[name];
            const idx = groupList.indexOf(name);
            if (idx !== -1) groupList.splice(idx, 1);
            if (currentGroup === name) currentGroup = 'all';
            renderCards();
            showToast(`已删除分组「${name}」`);
        }
        // 批量导入：换行符分隔，一行一条
        function batchImportCards() {
            const raw = modBatchInput.value;
            if (!raw.trim()) { alert('请输入字卡内容'); return; }
            const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
            if (!lines.length) { alert('没有有效内容'); return; }
            const target = modBatchGroupSelect.value;
            if (!groups[target]) { alert('目标分组不存在'); return; }
            const existing = new Set(groups[target]);
            const added = lines.filter(l => !existing.has(l));
            if (!added.length) {
                showToast('所有字卡已存在于该分组，无需重复添加');
                modBatchInput.value = '';
                return;
            }
            groups[target] = groups[target].concat(added);
            rebuildCardLibrary();
            modBatchInput.value = '';
            renderCards();
            showToast(`导入 ${added.length} 张字卡到「${target === 'default' ? '默认' : target}」`);
        }
        function clearAllCards() {
            if (!cardLibrary.length) return;
            if (!confirm('确定清空所有字卡吗？（通用和当前角色单人字卡都将清空）')) return;
            for (const g in groups) groups[g] = [];
            const cur = getCurrentRole();
            if (cur) cur.personalCards = [];
            rebuildCardLibrary();
            currentGroup = 'all';
            cardSelected.clear();
            renderCards();
            showToast('字卡已清空');
        }
        function resetDefaultCards() {
            if (cardLibrary.length && !confirm('覆盖当前字卡？')) return;
            groups = { default: [...DEFAULT_CARDS] };
            groupList = ['default'];
            rebuildCardLibrary();
            currentGroup = 'all';
            cardSelected.clear();
            cardSelectMode = false;
            modSelectBtn.textContent = '☑ 选择';
            renderCards();
            showToast('已恢复默认字卡');
        }

        // ===== JSON 批量导入通用函数（适用于 字卡/表情包/拍一拍 等分组型数据） =====
        function importJsonGroups(raw, targetSelect, groupsObj, groupListArr, renderFn, typeName) {
            if (!raw || !raw.trim()) { alert('请输入 JSON 内容'); return 0; }
            let data;
            try { data = JSON.parse(raw); }
            catch (e) { alert('JSON 解析失败：' + e.message); return 0; }

            let totalAdded = 0;

            if (Array.isArray(data)) {
                // 数组格式：全部导入到下拉选中的分组
                const target = targetSelect ? targetSelect.value : 'default';
                if (!groupsObj[target]) { groupsObj[target] = []; if (groupListArr && !groupListArr.includes(target)) groupListArr.push(target); }
                const existing = new Set(groupsObj[target]);
                const added = data.filter(item => typeof item === 'string' && item.trim() && !existing.has(item.trim()));
                groupsObj[target] = groupsObj[target].concat(added.map(s => s.trim()));
                totalAdded = added.length;
            } else if (data && typeof data === 'object') {
                let groupsData;
                if (data.groups && typeof data.groups === 'object' && !Array.isArray(data.groups)) {
                    groupsData = data.groups;
                } else {
                    groupsData = data;
                }
                for (const gName in groupsData) {
                    const items = groupsData[gName];
                    if (!Array.isArray(items)) continue;
                    if (!groupsObj[gName]) { groupsObj[gName] = []; if (groupListArr && !groupListArr.includes(gName)) groupListArr.push(gName); }
                    const existing = new Set(groupsObj[gName]);
                    const added = items.filter(item => typeof item === 'string' && item.trim() && !existing.has(item.trim()));
                    groupsObj[gName] = groupsObj[gName].concat(added.map(s => s.trim()));
                    totalAdded += added.length;
                }
            } else {
                alert('JSON 格式不正确：需为数组 ["a","b"] 或分组对象 {"分组名":["a","b"]}');
                return 0;
            }

            if (typeof renderFn === 'function') renderFn();
            return totalAdded;
        }

        function jsonImportCards() {
            const sel = document.getElementById('modJsonGroupSelect');
            const ta = document.getElementById('modJsonInput');
            const n = importJsonGroups(ta.value, sel, groups, groupList, renderCards, '字卡');
            if (n > 0) { ta.value = ''; showToast(`JSON 导入 ${n} 张字卡`); }
        }

        // ===== 表情包渲染（带分组 + 批量导入） =====
        function renderEmojis() {
            // 旧表情单页 UI 已被新的颜文字+emoji图片 双tab 替代；若不存在则不执行
            if (!legacyEmojiUIExists) return;
            emojiGroupTabs.innerHTML = '';
            let total = 0;
            for (const g in emojiGroups) total += emojiGroups[g].length;

            const allTab = document.createElement('span');
            allTab.className = `mod-group-tab ${emojiCurrentGroup === 'all' ? 'active' : ''}`;
            allTab.dataset.group = 'all';
            allTab.innerHTML = `全部 <span class="count">${total}</span>`;
            allTab.addEventListener('click', () => switchEmojiGroup('all'));
            emojiGroupTabs.appendChild(allTab);

            for (const gName of emojiGroupList) {
                if (gName === 'default') continue;
                const tab = document.createElement('span');
                tab.className = `mod-group-tab ${emojiCurrentGroup === gName ? 'active' : ''}`;
                tab.dataset.group = gName;
                const count = emojiGroups[gName] ? emojiGroups[gName].length : 0;
                tab.innerHTML = `${gName} <span class="count">${count}</span>`;
                tab.addEventListener('click', () => switchEmojiGroup(gName));
                emojiGroupTabs.appendChild(tab);
            }

            // 单条添加分组下拉
            emojiGroupSelect.innerHTML = '';
            for (const g of emojiGroupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                emojiGroupSelect.appendChild(opt);
            }
            // 批量导入分组下拉
            emojiBatchGroupSelect.innerHTML = '';
            for (const g of emojiGroupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                emojiBatchGroupSelect.appendChild(opt);
            }
            emojiMoveGroupSelect.innerHTML = '<option value="">移动到...</option>';
            for (const g of emojiGroupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                emojiMoveGroupSelect.appendChild(opt);
            }

            let display = [];
            if (emojiCurrentGroup === 'all') {
                for (const g in emojiGroups) display = display.concat(emojiGroups[g]);
            } else if (emojiGroups[emojiCurrentGroup]) {
                display = emojiGroups[emojiCurrentGroup];
            } else {
                emojiCurrentGroup = 'all';
                for (const g in emojiGroups) display = display.concat(emojiGroups[g]);
            }

            const kw = emojiSearch.trim().toLowerCase();
            if (kw) display = display.filter(e => e.toLowerCase().includes(kw));

            emojiList.innerHTML = '';
            if (!display.length) {
                const empty = document.createElement('span');
                empty.className = 'mod-empty';
                empty.textContent = kw ? '未找到匹配表情' : (emojiCurrentGroup === 'all' ? '暂无表情' : `「${emojiCurrentGroup}」为空`);
                emojiList.appendChild(empty);
            } else {
                const allEmojis = [];
                for (const g in emojiGroups) allEmojis.push(...emojiGroups[g]);

                display.forEach(e => {
                    const realIdx = allEmojis.indexOf(e);
                    let gName = '';
                    for (const g in emojiGroups) {
                        if (emojiGroups[g].includes(e)) { gName = g; break; }
                    }
                    const item = document.createElement('span');
                    item.className = 'mod-item';
                    if (emojiSelectMode && emojiSelected.has(realIdx)) item.classList.add('selected');
                    const label = gName !== 'default' ? `<span class="group-label">${gName}</span>` : '';
                    item.innerHTML = `${e} ${label} <span class="del" data-emoji="${e}">✕</span>`;
                    if (emojiSelectMode) {
                        item.style.cursor = 'pointer';
                        item.addEventListener('click', function(ev) {
                            if (ev.target.classList.contains('del')) return;
                            const emoji = this.querySelector('.del').dataset.emoji;
                            const idx = allEmojis.indexOf(emoji);
                            toggleEmojiSelect(idx);
                        });
                    }
                    emojiList.appendChild(item);
                });
                emojiList.querySelectorAll('.del').forEach(el => {
                    el.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const emoji = this.dataset.emoji;
                        for (const g in emojiGroups) {
                            const pos = emojiGroups[g].indexOf(emoji);
                            if (pos !== -1) emojiGroups[g].splice(pos, 1);
                        }
                        emojiSelected.clear();
                        renderEmojis();
                        showToast('已删除');
                    });
                });
            }

            const allEmojisCount = Object.values(emojiGroups).reduce((a, b) => a + b.length, 0);
            emojiCount.textContent = `${allEmojisCount} 个`;
            emojiAllCount.textContent = total;
            updateEmojiSelectUI();
        }
        function switchEmojiGroup(name) {
            if (name !== 'all' && !emojiGroups[name]) name = 'all';
            emojiCurrentGroup = name;
            emojiSelected.clear();
            renderEmojis();
        }
        function toggleEmojiSelect(idx) {
            if (emojiSelected.has(idx)) emojiSelected.delete(idx);
            else emojiSelected.add(idx);
            renderEmojis();
        }
        function updateEmojiSelectUI() {
            const count = emojiSelected.size;
            emojiSelectInfo.textContent = `已选 ${count}`;
            if (count > 0) {
                emojiDeleteSelectedBtn.style.display = 'inline-flex';
                emojiDeleteSelectedBtn.textContent = `删除选中(${count})`;
                emojiMoveRow.style.display = 'flex';
            } else {
                emojiDeleteSelectedBtn.style.display = 'none';
                emojiMoveRow.style.display = 'none';
            }
        }
        function toggleEmojiSelectMode() {
            emojiSelectMode = !emojiSelectMode;
            if (!emojiSelectMode) { emojiSelected.clear(); emojiSelectBtn.textContent = '☑ 选择'; }
            else { emojiSelectBtn.textContent = '✕ 取消'; }
            renderEmojis();
        }
        function deleteEmojiSelected() {
            if (!emojiSelected.size) return;
            if (!confirm(`删除选中的 ${emojiSelected.size} 个表情？`)) return;
            const allEmojis = [];
            for (const g in emojiGroups) allEmojis.push(...emojiGroups[g]);
            const sorted = Array.from(emojiSelected).sort((a, b) => b - a);
            for (const idx of sorted) {
                const e = allEmojis[idx];
                for (const g in emojiGroups) {
                    const pos = emojiGroups[g].indexOf(e);
                    if (pos !== -1) emojiGroups[g].splice(pos, 1);
                }
            }
            emojiSelected.clear();
            emojiSelectMode = false;
            emojiSelectBtn.textContent = '☑ 选择';
            renderEmojis();
            showToast(`已删除 ${sorted.length} 个表情`);
        }
        function moveEmojiSelected() {
            if (!emojiSelected.size) { alert('请先选择表情'); return; }
            const target = emojiMoveGroupSelect.value;
            if (!target || !emojiGroups[target]) { alert('请选择目标分组'); return; }
            const allEmojis = [];
            for (const g in emojiGroups) allEmojis.push(...emojiGroups[g]);
            const count = emojiSelected.size;
            const items = [];
            const sorted = Array.from(emojiSelected).sort((a, b) => b - a);
            for (const idx of sorted) items.push(allEmojis[idx]);
            for (const e of items) {
                for (const g in emojiGroups) {
                    const pos = emojiGroups[g].indexOf(e);
                    if (pos !== -1) { emojiGroups[g].splice(pos, 1); break; }
                }
            }
            emojiGroups[target] = emojiGroups[target].concat(items);
            const seen = new Set();
            emojiGroups[target] = emojiGroups[target].filter(e => { if (seen.has(e)) return false; seen.add(e); return true; });
            emojiSelected.clear();
            emojiSelectMode = false;
            emojiSelectBtn.textContent = '☑ 选择';
            renderEmojis();
            showToast(`移动 ${count} 个表情到「${target === 'default' ? '默认' : target}」`);
        }
        function addEmoji() {
            const val = emojiInput.value.trim();
            if (!val) { alert('请输入表情'); return; }
            const target = emojiGroupSelect.value;
            if (!emojiGroups[target]) { alert('目标分组不存在'); return; }
            if (emojiGroups[target].includes(val)) { showToast('已存在'); return; }
            emojiGroups[target].push(val);
            emojiInput.value = '';
            renderEmojis();
            showToast('已添加');
        }
        // 表情批量导入：换行符分隔，一行一条
        function batchImportEmojis() {
            const raw = emojiBatchInput.value;
            if (!raw.trim()) { alert('请输入表情内容'); return; }
            const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
            if (!lines.length) { alert('没有有效内容'); return; }
            const target = emojiBatchGroupSelect.value;
            if (!emojiGroups[target]) { alert('目标分组不存在'); return; }
            const existing = new Set(emojiGroups[target]);
            const added = lines.filter(l => !existing.has(l));
            if (!added.length) {
                showToast('所有表情已存在于该分组，无需重复添加');
                emojiBatchInput.value = '';
                return;
            }
            emojiGroups[target] = emojiGroups[target].concat(added);
            emojiBatchInput.value = '';
            renderEmojis();
            showToast(`导入 ${added.length} 个表情到「${target === 'default' ? '默认' : target}」`);
        }
        function addEmojiGroup() {
            const name = emojiGroupInput.value.trim();
            if (!name) { alert('请输入分组名称'); return; }
            if (name === 'all' || name === 'default') { alert('不能使用 "all" 或 "default"'); return; }
            if (emojiGroups[name]) { alert(`「${name}」已存在`); return; }
            emojiGroups[name] = [];
            emojiGroupList.push(name);
            emojiGroupInput.value = '';
            renderEmojis();
            showToast(`创建分组「${name}」`);
        }
        function deleteEmojiGroup() {
            if (emojiGroupList.length <= 1) { alert('至少保留一个分组'); return; }
            const name = prompt('输入要删除的分组名（表情移至"默认"）：');
            if (!name) return;
            if (name === 'default') { alert('不能删除默认分组'); return; }
            if (!emojiGroups[name]) { alert(`「${name}」不存在`); return; }
            if (!confirm(`删除「${name}」？${emojiGroups[name].length} 个表情移至"默认"`)) return;
            if (emojiGroups[name].length) {
                emojiGroups['default'] = emojiGroups['default'].concat(emojiGroups[name]);
                const seen = new Set();
                emojiGroups['default'] = emojiGroups['default'].filter(e => { if (seen.has(e)) return false; seen.add(e); return true; });
            }
            delete emojiGroups[name];
            const idx = emojiGroupList.indexOf(name);
            if (idx !== -1) emojiGroupList.splice(idx, 1);
            if (emojiCurrentGroup === name) emojiCurrentGroup = 'all';
            renderEmojis();
            showToast(`已删除分组「${name}」`);
        }
        function clearEmojis() {
            const total = Object.values(emojiGroups).reduce((a, b) => a + b.length, 0);
            if (!total) return;
            if (!confirm('清空所有表情？')) return;
            for (const g in emojiGroups) emojiGroups[g] = [];
            emojiSelected.clear();
            renderEmojis();
            showToast('已清空');
        }
        function resetEmojis() {
            if (Object.values(emojiGroups).reduce((a, b) => a + b.length, 0) && !confirm('恢复默认表情？')) return;
            emojiGroups = { default: [...DEFAULT_KAOMOJIS] };
            emojiGroupList = ['default'];
            emojiCurrentGroup = 'all';
            emojiSelected.clear();
            emojiSelectMode = false;
            emojiSelectBtn.textContent = '☑ 选择';
            renderEmojis();
            showToast('已恢复默认');
        }

        // ===== 拍一拍渲染（带分组 + 批量导入） =====
        function renderPats() {
            patGroupTabs.innerHTML = '';
            let total = 0;
            for (const g in patGroups) total += patGroups[g].length;

            const allTab = document.createElement('span');
            allTab.className = `mod-group-tab ${patCurrentGroup === 'all' ? 'active' : ''}`;
            allTab.dataset.group = 'all';
            allTab.innerHTML = `全部 <span class="count">${total}</span>`;
            allTab.addEventListener('click', () => switchPatGroup('all'));
            patGroupTabs.appendChild(allTab);

            for (const gName of patGroupList) {
                if (gName === 'default') continue;
                const tab = document.createElement('span');
                tab.className = `mod-group-tab ${patCurrentGroup === gName ? 'active' : ''}`;
                tab.dataset.group = gName;
                const count = patGroups[gName] ? patGroups[gName].length : 0;
                tab.innerHTML = `${gName} <span class="count">${count}</span>`;
                tab.addEventListener('click', () => switchPatGroup(gName));
                patGroupTabs.appendChild(tab);
            }

            patGroupSelect.innerHTML = '';
            for (const g of patGroupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                patGroupSelect.appendChild(opt);
            }
            patBatchGroupSelect.innerHTML = '';
            for (const g of patGroupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                patBatchGroupSelect.appendChild(opt);
            }
            const patJsonGroupSelect = document.getElementById('patJsonGroupSelect');
            if (patJsonGroupSelect) {
                patJsonGroupSelect.innerHTML = '';
                for (const g of patGroupList) {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g === 'default' ? '默认' : g;
                    patJsonGroupSelect.appendChild(opt);
                }
            }
            patMoveGroupSelect.innerHTML = '<option value="">移动到...</option>';
            for (const g of patGroupList) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g === 'default' ? '默认' : g;
                patMoveGroupSelect.appendChild(opt);
            }

            let display = [];
            if (patCurrentGroup === 'all') {
                for (const g in patGroups) display = display.concat(patGroups[g]);
            } else if (patGroups[patCurrentGroup]) {
                display = patGroups[patCurrentGroup];
            } else {
                patCurrentGroup = 'all';
                for (const g in patGroups) display = display.concat(patGroups[g]);
            }

            const kw = patSearch.trim().toLowerCase();
            if (kw) display = display.filter(p => p.toLowerCase().includes(kw));

            patList.innerHTML = '';
            if (!display.length) {
                const empty = document.createElement('span');
                empty.className = 'mod-empty';
                empty.textContent = kw ? '未找到匹配拍一拍' : (patCurrentGroup === 'all' ? '暂无拍一拍' : `「${patCurrentGroup}」为空`);
                patList.appendChild(empty);
            } else {
                const allPats = [];
                for (const g in patGroups) allPats.push(...patGroups[g]);

                display.forEach(p => {
                    const realIdx = allPats.indexOf(p);
                    let gName = '';
                    for (const g in patGroups) {
                        if (patGroups[g].includes(p)) { gName = g; break; }
                    }
                    const item = document.createElement('span');
                    item.className = 'mod-item';
                    if (patSelectMode && patSelected.has(realIdx)) item.classList.add('selected');
                    const label = gName !== 'default' ? `<span class="group-label">${gName}</span>` : '';
                    item.innerHTML = `${p} ${label} <span class="del" data-pat="${p}">✕</span>`;
                    if (patSelectMode) {
                        item.style.cursor = 'pointer';
                        item.addEventListener('click', function(e) {
                            if (e.target.classList.contains('del')) return;
                            const pat = this.querySelector('.del').dataset.pat;
                            const idx = allPats.indexOf(pat);
                            togglePatSelect(idx);
                        });
                    }
                    patList.appendChild(item);
                });
                patList.querySelectorAll('.del').forEach(el => {
                    el.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const pat = this.dataset.pat;
                        for (const g in patGroups) {
                            const pos = patGroups[g].indexOf(pat);
                            if (pos !== -1) patGroups[g].splice(pos, 1);
                        }
                        patSelected.clear();
                        renderPats();
                        showToast('已删除');
                    });
                });
            }

            const allPatsCount = Object.values(patGroups).reduce((a, b) => a + b.length, 0);
            patCount.textContent = `${allPatsCount} 个`;
            patAllCount.textContent = total;
            updatePatSelectUI();
        }
        function switchPatGroup(name) {
            if (name !== 'all' && !patGroups[name]) name = 'all';
            patCurrentGroup = name;
            patSelected.clear();
            renderPats();
        }
        function togglePatSelect(idx) {
            if (patSelected.has(idx)) patSelected.delete(idx);
            else patSelected.add(idx);
            renderPats();
        }
        function updatePatSelectUI() {
            const count = patSelected.size;
            patSelectInfo.textContent = `已选 ${count}`;
            if (count > 0) {
                patDeleteSelectedBtn.style.display = 'inline-flex';
                patDeleteSelectedBtn.textContent = `删除选中(${count})`;
                patMoveRow.style.display = 'flex';
            } else {
                patDeleteSelectedBtn.style.display = 'none';
                patMoveRow.style.display = 'none';
            }
        }
        function togglePatSelectMode() {
            patSelectMode = !patSelectMode;
            if (!patSelectMode) { patSelected.clear(); patSelectBtn.textContent = '☑ 选择'; }
            else { patSelectBtn.textContent = '✕ 取消'; }
            renderPats();
        }
        function deletePatSelected() {
            if (!patSelected.size) return;
            if (!confirm(`删除选中的 ${patSelected.size} 个拍一拍？`)) return;
            const allPats = [];
            for (const g in patGroups) allPats.push(...patGroups[g]);
            const sorted = Array.from(patSelected).sort((a, b) => b - a);
            for (const idx of sorted) {
                const p = allPats[idx];
                for (const g in patGroups) {
                    const pos = patGroups[g].indexOf(p);
                    if (pos !== -1) patGroups[g].splice(pos, 1);
                }
            }
            patSelected.clear();
            patSelectMode = false;
            patSelectBtn.textContent = '☑ 选择';
            renderPats();
            showToast(`已删除 ${sorted.length} 个拍一拍`);
        }
        function movePatSelected() {
            if (!patSelected.size) { alert('请先选择拍一拍'); return; }
            const target = patMoveGroupSelect.value;
            if (!target || !patGroups[target]) { alert('请选择目标分组'); return; }
            const allPats = [];
            for (const g in patGroups) allPats.push(...patGroups[g]);
            const count = patSelected.size;
            const items = [];
            const sorted = Array.from(patSelected).sort((a, b) => b - a);
            for (const idx of sorted) items.push(allPats[idx]);
            for (const p of items) {
                for (const g in patGroups) {
                    const pos = patGroups[g].indexOf(p);
                    if (pos !== -1) { patGroups[g].splice(pos, 1); break; }
                }
            }
            patGroups[target] = patGroups[target].concat(items);
            const seen = new Set();
            patGroups[target] = patGroups[target].filter(p => { if (seen.has(p)) return false; seen.add(p); return true; });
            patSelected.clear();
            patSelectMode = false;
            patSelectBtn.textContent = '☑ 选择';
            renderPats();
            showToast(`移动 ${count} 个拍一拍到「${target === 'default' ? '默认' : target}」`);
        }
        function addPat() {
            const val = patInput.value.trim();
            if (!val) { alert('请输入拍一拍内容'); return; }
            const target = patGroupSelect.value;
            if (!patGroups[target]) { alert('目标分组不存在'); return; }
            if (patGroups[target].includes(val)) { showToast('已存在'); return; }
            patGroups[target].push(val);
            patInput.value = '';
            renderPats();
            showToast('已添加');
        }
        // 拍一拍批量导入：换行符分隔，一行一条
        function batchImportPats() {
            const raw = patBatchInput.value;
            if (!raw.trim()) { alert('请输入拍一拍内容'); return; }
            const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
            if (!lines.length) { alert('没有有效内容'); return; }
            const target = patBatchGroupSelect.value;
            if (!patGroups[target]) { alert('目标分组不存在'); return; }
            const existing = new Set(patGroups[target]);
            const added = lines.filter(l => !existing.has(l));
            if (!added.length) {
                showToast('所有拍一拍已存在于该分组，无需重复添加');
                patBatchInput.value = '';
                return;
            }
            patGroups[target] = patGroups[target].concat(added);
            patBatchInput.value = '';
            renderPats();
            showToast(`导入 ${added.length} 个拍一拍到「${target === 'default' ? '默认' : target}」`);
        }
        function jsonImportPats() {
            const sel = document.getElementById('patJsonGroupSelect');
            const ta = document.getElementById('patJsonInput');
            const n = importJsonGroups(ta.value, sel, patGroups, patGroupList, renderPats, '拍一拍');
            if (n > 0) { ta.value = ''; showToast(`JSON 导入 ${n} 个拍一拍`); }
        }
        function addPatGroup() {
            const name = patGroupInput.value.trim();
            if (!name) { alert('请输入分组名称'); return; }
            if (name === 'all' || name === 'default') { alert('不能使用 "all" 或 "default"'); return; }
            if (patGroups[name]) { alert(`「${name}」已存在`); return; }
            patGroups[name] = [];
            patGroupList.push(name);
            patGroupInput.value = '';
            renderPats();
            showToast(`创建分组「${name}」`);
        }
        function deletePatGroup() {
            if (patGroupList.length <= 1) { alert('至少保留一个分组'); return; }
            const name = prompt('输入要删除的分组名（拍一拍移至"默认"）：');
            if (!name) return;
            if (name === 'default') { alert('不能删除默认分组'); return; }
            if (!patGroups[name]) { alert(`「${name}」不存在`); return; }
            if (!confirm(`删除「${name}」？${patGroups[name].length} 个拍一拍移至"默认"`)) return;
            if (patGroups[name].length) {
                patGroups['default'] = patGroups['default'].concat(patGroups[name]);
                const seen = new Set();
                patGroups['default'] = patGroups['default'].filter(p => { if (seen.has(p)) return false; seen.add(p); return true; });
            }
            delete patGroups[name];
            const idx = patGroupList.indexOf(name);
            if (idx !== -1) patGroupList.splice(idx, 1);
            if (patCurrentGroup === name) patCurrentGroup = 'all';
            renderPats();
            showToast(`已删除分组「${name}」`);
        }
        function clearPats() {
            const total = Object.values(patGroups).reduce((a, b) => a + b.length, 0);
            if (!total) return;
            if (!confirm('清空所有拍一拍？')) return;
            for (const g in patGroups) patGroups[g] = [];
            patSelected.clear();
            renderPats();
            showToast('已清空');
        }
        function resetPats() {
            if (Object.values(patGroups).reduce((a, b) => a + b.length, 0) && !confirm('恢复默认拍一拍？')) return;
            patGroups = { default: [...DEFAULT_PATS] };
            patGroupList = ['default'];
            patCurrentGroup = 'all';
            patSelected.clear();
            patSelectMode = false;
            patSelectBtn.textContent = '☑ 选择';
            renderPats();
            showToast('已恢复默认');
        }

        // ===== 通话 =====
        function updateCallUI(state, msg) {
            const map = {
                idle: { btn: '📞 呼叫', showHangup: false, dot: 'off', text: '💤 待机中' },
                calling: { btn: '📞 呼叫中', showHangup: true, dot: 'calling', text: '📞 正在呼叫...' },
                connected: { btn: '📞 通话中', showHangup: true, dot: 'on', text: '💬 通话中...' }
            };
            const s = map[state] || map.idle;
            callBtn.textContent = s.btn;
            callBtn.className = `btn-call${state === 'calling' ? ' ringing' : ''}`;
            hangupBtn.style.display = s.showHangup ? 'inline-flex' : 'none';
            callDreamerDot.className = `dot ${s.dot}`;
            callAngleDot.className = `dot ${s.dot}`;
            callStatusText.textContent = msg || s.text;
            callState = state;
        }
        function startCall() {
            if (callState === 'calling' || callState === 'connected') return;
            updateCallUI('calling');
            addChatMessage(`📞 ${userName}拨通了${angleName}的视频...`, 'system');
            if (callTimer) clearTimeout(callTimer);
            callTimer = setTimeout(() => {
                if (callState === 'calling') {
                    updateCallUI('connected');
                    addChatMessage(`💬 ${angleName}接听了视频通话！`, 'system');
                    callTimer = setTimeout(() => {
                        if (callState === 'connected') {
                            addChatMessage(`🌙 ${angleName}：我一直在看着你……`, 'system');
                        }
                    }, 3000);
                }
            }, 2000);
        }
        function hangupCall() {
            if (callTimer) { clearTimeout(callTimer); callTimer = null; }
            const was = callState === 'connected';
            updateCallUI('idle');
            addChatMessage(was ? '📴 视频通话已挂断' : '📴 已取消呼叫', 'system');
        }

        // ===== 回应抽取 =====
        function replyWithRandomCard(isActive) {
            hideTyping();
            if (!cardLibrary.length) {
                addChatMessage(`${angleName}沉默不语…… 字卡空空如也。`, 'angle');
                return;
            }
            // ========== chatCustomReplyRule：开=全套自定义，关=强制 simple random 一张 ==========
            const useRule = !!chatCustomReplyRule;
            const effPickMode = useRule ? chatPickMode : 'random';
            const effMerge    = useRule ? !!chatMergeCards    : false;
            const effEmoji    = useRule ? !!chatEmojiMix      : false;
            const effKao      = useRule ? !!chatKaomojiMix    : false;

            // 抽一张字卡
            function pickOne() {
                if (effPickMode === 'sequence') {
                    const p = cardLibrary[seqCursor % cardLibrary.length];
                    seqCursor++;
                    return p;
                } else if (effPickMode === 'norepeat') {
                    if (!replyWithRandomCard._pool || !replyWithRandomCard._pool.length) {
                        replyWithRandomCard._pool = cardLibrary.slice(0);
                    }
                    const ii = Math.floor(Math.random() * replyWithRandomCard._pool.length);
                    return replyWithRandomCard._pool.splice(ii, 1)[0];
                } else {
                    return cardLibrary[Math.floor(Math.random() * cardLibrary.length)];
                }
            }

            let msg;
            if (effMerge) {
                // 拼卡条数：chatMergeCount（用户滑块设的 2-10）±1 随机浮动，防止每次都精准到同一数值
                const baseCount = Math.max(2, Math.min(10, chatMergeCount || 3));
                const count = Math.max(2, Math.min(10, baseCount + (Math.random() < 0.5 ? 0 : (Math.random() < 0.5 ? -1 : 1))));
                const parts = [];
                for (let j = 0; j < count; j++) parts.push(pickOne());
                // 50% 逗号，50% 换行拼接
                msg = parts.join(Math.random() < 0.5 ? '，' : '\n');
            } else {
                msg = pickOne();
            }
            if (isActive) msg = '✦ ' + msg;

            // ========== 表情混入（60% 概率，前/中/后 三段） ==========
            if (effEmoji && Math.random() < 0.6) {
                const flat = [];
                for (const g in emojiGroups) flat.push.apply(flat, (emojiGroups[g] || []));
                if (flat.length) {
                    const em = flat[Math.floor(Math.random() * flat.length)];
                    const roll = Math.random();
                    if (roll < 0.35) msg = em + msg;
                    else if (roll < 0.7) msg = msg + em;
                    else {
                        // 中间：按换行或逗号切
                        const chunks = msg.split(/(\n|，)/);
                        if (chunks.length >= 3) {
                            const mid = Math.floor(chunks.length / 2);
                            chunks.splice(mid, 0, em);
                            msg = chunks.join('');
                        } else {
                            msg = msg.slice(0, Math.floor(msg.length / 2)) + em + msg.slice(Math.floor(msg.length / 2));
                        }
                    }
                }
            }

            // 梦角回复开头混入称呼（按 angleCallChance 概率，从 angleCallsUser 选）
            if (angleCallsUser && angleCallsUser.length && Math.random() * 100 < angleCallChance) {
                const call = angleCallsUser[Math.floor(Math.random() * angleCallsUser.length)];
                msg = `${call}，${msg}`;
            }

            // ========== 颜文字混入（50% 概率，换行 or 末尾空格） ==========
            if (effKao && Math.random() < 0.5) {
                const kaoFlat = [];
                for (const g in kaomojiGroups) kaoFlat.push.apply(kaoFlat, (kaomojiGroups[g] || []));
                if (kaoFlat.length) {
                    const k = kaoFlat[Math.floor(Math.random() * kaoFlat.length)];
                    if (Math.random() < 0.7) msg = msg + '\n' + k;
                    else msg = msg + ' ' + k;
                }
            }

            // 如果用户是引用回复，梦角也可能带引用；type 改成 angle 让 sender/头像/提示音 正确生效
            if (quoteMsg && Math.random() < 0.5) {
                addChatMessage(msg, 'angle', { quote: quoteMsg });
                quoteMsg = null;
                return;
            }
            addChatMessage(msg, 'angle');
        }

        // ===== 正在输入指示器 =====
        function showTyping() {
            if (!chatTypingEnabled) return;
            const el = document.getElementById('typingIndicator');
            const txt = document.getElementById('typingText');
            if (el) {
                if (txt) txt.textContent = `${angleName} 正在输入…`;
                el.classList.add('show');
            }
        }
        function hideTyping() {
            const el = document.getElementById('typingIndicator');
            if (el) el.classList.remove('show');
            if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
        }

        // 显示引用回复栏
        function showQuoteBar(sender, text) {
            const bar = document.getElementById('quoteBar');
            const fromEl = document.getElementById('quoteBarFrom');
            const textEl = document.getElementById('quoteBarText');
            if (!bar) return;
            const safeText = (text == null) ? '' : String(text);
            if (fromEl) fromEl.textContent = (sender === 'usr' ? userName : angleName) + '：';
            if (textEl) textEl.textContent = safeText.length > 40 ? safeText.slice(0, 40) + '…' : safeText;
            bar.classList.add('show');
        }
        function clearQuoteBar() {
            const bar = document.getElementById('quoteBar');
            if (bar) bar.classList.remove('show');
        }

        function handleSend() {
            const text = userInput.value.trim();
            if (!text) return;
            const opts = {};
            if (quoteMsg) { opts.quote = quoteMsg; quoteMsg = null; clearQuoteBar(); }
            addChatMessage(text, 'user', opts);
            userInput.value = '';
            userInput.focus();
            if (chatSoundMsg) playSfx('send');
            // 已读不回：已开启时 45% 概率不回（但消息还是会在 1.5–5s 延迟标记"已读" ✓✓）
            if (chatReadNoReply && Math.random() < 0.45) return;
            // 随机延迟区间回复：chatReplySpeed (ms) 作为基础，叠加 [minD,maxD]
            const minD = Math.max(100, Math.floor(Math.min(replyDelayMin || 0, replyDelayMax || 0)));
            const maxD = Math.max(minD + 200, Math.floor(Math.max(replyDelayMin || 0, replyDelayMax || 0)));
            const baseSpeed = isNaN(chatReplySpeed) ? 0 : Math.max(0, Math.floor(chatReplySpeed));
            const delay = baseSpeed + minD + Math.floor(Math.random() * Math.max(1, (maxD - minD)));
            // 防止用户连发消息时定时器叠加：清掉上一条 pending replyTimer
            if (replyTimer) { clearTimeout(replyTimer); replyTimer = null; }
            showTyping();
            replyTimer = setTimeout(() => { replyWithRandomCard(); }, delay);
        }

        // 直接发送表情包图片（不进输入框）
        function sendEmojiImage(url) {
            if (!url) return;
            const imgHtml = `<img src="${url}" style="max-width:180px;max-height:180px;vertical-align:middle;border-radius:10px;">`;
            const opts = {};
            if (quoteMsg) { opts.quote = quoteMsg; quoteMsg = null; clearQuoteBar(); }
            addChatMessage(imgHtml, 'user', opts);
            if (chatSoundMsg) playSfx('send');
            // 已读不回
            if (chatReadNoReply && Math.random() < 0.45) return;
            const minD = Math.max(100, Math.floor(Math.min(replyDelayMin || 0, replyDelayMax || 0)));
            const maxD = Math.max(minD + 200, Math.floor(Math.max(replyDelayMin || 0, replyDelayMax || 0)));
            const baseSpeed = isNaN(chatReplySpeed) ? 0 : Math.max(0, Math.floor(chatReplySpeed));
            const delay = baseSpeed + minD + Math.floor(Math.random() * Math.max(1, (maxD - minD)));
            if (replyTimer) { clearTimeout(replyTimer); replyTimer = null; }
            showTyping();
            replyTimer = setTimeout(() => { replyWithRandomCard(); }, delay);
        }

        // ===== 拍一拍触发 =====
        // 格式化拍一拍文案：将"靠了靠肩膀"拆分为"靠了靠"+"肩膀"，显示为"小鱼 靠了靠 我的肩膀"
        function formatPatText(pat, sender, receiver) {
            // ===== 预处理 =====
            let cleaned = pat.trim();
            cleaned = cleaned.replace(/^(我|你|您|ta|他|她|TA|它|对方|他的|她的)\s*/, '');
            if (!cleaned) return `${sender} 拍了拍 ${receiver}`;

            // 内部通用：按"了"字拆分 verb + body
            function splitByLe(text) {
                const idx = text.lastIndexOf('了');
                if (idx < 0) return null;
                const beforeLe = idx > 0 ? text[idx - 1] : '';
                const afterLe = idx + 1 < text.length ? text[idx + 1] : '';
                let verbEnd;
                if (beforeLe && beforeLe === afterLe) verbEnd = idx + 2;  // A了A
                else verbEnd = idx + 1;                                    // AA了 / 动词了
                let verb = text.substring(0, verbEnd);
                let body = text.substring(verbEnd).trim();
                // body 去所属格前缀
                body = body.replace(/^(他|她|ta|TA|我|你|您)的/, '');
                return { verb, body };
            }
            function formatResult(verb, body) {
                if (!body) return `${sender} ${verb} ${receiver}`;
                // body 为纯代词，直接用 receiver 名
                if (/^(他|她|ta|TA|我|你|您|对方)$/.test(body)) {
                    return `${sender} ${verb} ${receiver}`;
                }
                return `${sender} ${verb} ${receiver}的${body}`;
            }

            // ===== 第一步：有"了"字，直接按了字拆分 =====
            if (cleaned.indexOf('了') >= 0) {
                const r = splitByLe(cleaned);
                if (r) return formatResult(r.verb, r.body);
            }

            // ===== 第二步：无"了"字，匹配 [动词][代词][名词] 结构 =====
            // 如 打你屁屁 / 摸你头 / 抱抱你 / 戳他肩膀 / 亲亲我
            const m = cleaned.match(/^(.+?)(你|我|他|她|ta|TA|您)(.*)$/);
            if (m) {
                let verb = m[1];
                let body = m[3].trim().replace(/^的/, '');
                // 规范化动词（补"了"字）
                let verbFmt;
                if (/^(.)\1$/.test(verb)) {
                    // AA重复型（抱抱/摸摸/亲亲）→ A了A
                    verbFmt = verb[0] + '了' + verb[0];
                } else if (verb.length === 1) {
                    // 单字动词（打/摸/捏/戳/拍）→ V了
                    verbFmt = verb + '了';
                } else {
                    // 多字动词（轻轻打 / 偷偷摸）→ 末尾补"了"
                    verbFmt = verb + '了';
                }
                return formatResult(verbFmt, body);
            }

            // ===== 第三步：无"了"无代词，启发式补"了" =====
            let fixed;
            if (/^(.)\1/.test(cleaned) && cleaned.length > 2) {
                // AA+名词 结构（摸摸头 / 捏捏脸 / 拍拍肩膀）→ A了A + 名词
                fixed = cleaned[0] + '了' + cleaned[0] + cleaned.substring(2);
            } else if (cleaned.length >= 2) {
                // 单字动词+名词 结构（拍肩膀 / 捏脸蛋 / 打屁屁）→ V了 + 名词
                fixed = cleaned[0] + '了' + cleaned.substring(1);
            } else {
                fixed = cleaned + '了';  // 单字兜底
            }
            const r2 = splitByLe(fixed);
            if (r2) return formatResult(r2.verb, r2.body);

            // ===== 第四步：兜底朴素输出 =====
            return `${sender} ${cleaned} ${receiver}`;
        }
        // 添加拍一拍居中通知
        function addPatNotice(text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'message pat-notice';
            const contentDiv = document.createElement('div');
            contentDiv.className = 'msg-content';
            contentDiv.textContent = text;
            msgDiv.appendChild(contentDiv);
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        // 渲染快捷拍一拍 chips
        function renderQuickPatChips() {
            const container = document.getElementById('quickPatChips');
            if (!container) return;
            container.innerHTML = '';
            if (!quickPats.length) {
                container.innerHTML = '<span class="pat-quick-empty">暂无快捷回复</span>';
                return;
            }
            quickPats.forEach((p, i) => {
                const chip = document.createElement('span');
                chip.className = 'pat-quick-chip';
                chip.innerHTML = p + ' <span class="del" data-qp-idx="' + i + '">×</span>';
                // 点击 chip 文字部分发送
                chip.addEventListener('click', (e) => {
                    if (e.target.classList.contains('del')) return;
                    sendPat(p);
                });
                container.appendChild(chip);
            });
        }
        // 发送指定拍一拍
        function sendPat(patText) {
            const now = Date.now();
            if (now - patLastUserTime < patUserInterval) {
                showToast('拍一拍太快了，稍等一下');
                return;
            }
            patLastUserTime = now;
            const userPatText = formatPatText(patText, userName, angleName);
            addPatNotice(userPatText);
            // 关闭面板
            closePatQuickPanel();
            // ta 回拍
            if (now - patLastAngleTime >= patAngleInterval && Math.random() * 100 < patAngleReplyChance) {
                patLastAngleTime = now;
                setTimeout(() => {
                    const allPats2 = [...Object.values(patGroups).flat(), ...quickPats];
                    let anglePatText;
                    if (!allPats2.length) {
                        anglePatText = `${angleName} 拍了拍 ${userName}`;
                    } else {
                        const pat = allPats2[Math.floor(Math.random() * allPats2.length)];
                        anglePatText = formatPatText(pat, angleName, userName);
                    }
                    addPatNotice(anglePatText);
                }, patUserInterval + Math.random() * 2000);
            }
        }
        // 打开/关闭拍一拍快捷面板
        function openPatQuickPanel() {
            const panel = document.getElementById('patQuickPanel');
            if (panel) panel.classList.add('open');
            renderQuickPatChips();
        }
        function closePatQuickPanel() {
            const panel = document.getElementById('patQuickPanel');
            if (panel) panel.classList.remove('open');
        }
        // 表情包快捷预览面板
        function renderEmojiQuickPreview() {
            const grid = document.getElementById('emojiQuickGrid');
            if (!grid) return;
            grid.innerHTML = '';
            // 收集所有分组的 emoji 图片
            const all = [];
            for (const g in emojiImgGroups) {
                (emojiImgGroups[g] || []).forEach(item => all.push(item));
            }
            if (!all.length) {
                grid.innerHTML = '<span class="emoji-quick-empty">暂无表情包，去添加吧~</span>';
                return;
            }
            all.forEach(item => {
                const d = document.createElement('div');
                d.className = 'emoji-quick-item';
                d.title = item.name || '表情';
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.name || '表情';
                img.loading = 'lazy';
                img.onerror = () => { img.style.opacity = '0.3'; };
                d.appendChild(img);
                d.addEventListener('click', () => {
                    closeEmojiQuickPanel();
                    sendEmojiImage(item.url);
                });
                grid.appendChild(d);
            });
        }
        function openEmojiQuickPanel() {
            const panel = document.getElementById('emojiQuickPanel');
            if (panel) panel.classList.add('open');
            renderEmojiQuickPreview();
        }
        function closeEmojiQuickPanel() {
            const panel = document.getElementById('emojiQuickPanel');
            if (panel) panel.classList.remove('open');
        }
        function triggerPat(who) {
            if (!patDblClickEnabled) return;
            const now = Date.now();
            if (now - patLastUserTime < patUserInterval) return;
            patLastUserTime = now;
            const allPats = [...Object.values(patGroups).flat(), ...quickPats];
            const target = who === 'user' ? '自己' : angleName;
            let userPatText;
            if (!allPats.length) {
                userPatText = `${userName} 拍了拍 ${target}`;
            } else {
                const pat = allPats[Math.floor(Math.random() * allPats.length)];
                // 把默认目标替换成实际对象
                userPatText = formatPatText(pat, userName, target);
            }
            addPatNotice(userPatText);
            // ta 回拍（只在拍梦角时才概率回拍）
            if (who !== 'user' && now - patLastAngleTime >= patAngleInterval && Math.random() * 100 < patAngleReplyChance) {
                patLastAngleTime = now;
                setTimeout(() => {
                    const allPats2 = [...Object.values(patGroups).flat(), ...quickPats];
                    let anglePatText;
                    if (!allPats2.length) {
                        anglePatText = `${angleName} 拍了拍 ${userName}`;
                    } else {
                        const pat = allPats2[Math.floor(Math.random() * allPats2.length)];
                        anglePatText = formatPatText(pat, angleName, userName);
                    }
                    addPatNotice(anglePatText);
                }, patUserInterval + Math.random() * 2000);
            }
        }

        // ===== 主动发送定时器 =====
        function restartAutoSendTimer() {
            if (autoSendTimer) { clearTimeout(autoSendTimer); autoSendTimer = null; }
            if (!autoSendEnabled || !cardLibrary.length) return;
            const intervalMs = autoSendInterval * 60 * 1000;
            autoSendTimer = setTimeout(() => {
                // 主动发送前显示正在输入
                showTyping();
                const shortDelay = 1500 + Math.random() * 2000;
                setTimeout(() => { replyWithRandomCard(true); }, shortDelay);
                restartAutoSendTimer(); // 递归重启
            }, intervalMs);
        }

        // ===== 外观设置：气泡 / 背景&字体 / 主题 应用 =====

        // ===== 渲染称呼列表 =====
        function renderCallLists() {
            const uaList = document.getElementById('userCallsAngleList');
            const auList = document.getElementById('angleCallsUserList');
            if (uaList) {
                uaList.innerHTML = '';
                userCallsAngle.forEach((c, i) => {
                    const chip = document.createElement('span');
                    chip.className = 'call-chip';
                    chip.innerHTML = c + ' <span class="del" data-idx="' + i + '" data-dir="u2a">×</span>';
                    uaList.appendChild(chip);
                });
            }
            if (auList) {
                auList.innerHTML = '';
                angleCallsUser.forEach((c, i) => {
                    const chip = document.createElement('span');
                    chip.className = 'call-chip';
                    chip.innerHTML = c + ' <span class="del" data-idx="' + i + '" data-dir="a2u">×</span>';
                    auList.appendChild(chip);
                });
            }
        }

        // ===== 主题外观：恢复默认 =====
        const restoreThemeBtn = document.getElementById('restoreThemeBtn');
        if (restoreThemeBtn) restoreThemeBtn.addEventListener('click', () => {
            if (!confirm('恢复默认梦紫主题？所有自定义配色将被重置。')) return;
            currentTheme = 'lavender';
            localStorage.removeItem('lingstar_theme_vars');
            localStorage.removeItem('lingstar_current_theme');
            applyThemeVariables(THEME_PRESETS.lavender);
            document.querySelectorAll('#themeQuickSwatches .quick-swatch').forEach(x => x.classList.remove('active'));
            document.querySelector('#themeQuickSwatches .quick-swatch[data-quick="lavender"]')?.classList.add('active');
            // 主题外观不是预置之一，找最接近的 brown? 不对，恢复梦紫应该选 lavender
            // lavender 不在 quick swatches 列表里，但 purple 接近。实际恢复默认就是应用 lavender 预设
            showToast('已恢复默认主题');
        });

        // ===== 气泡：恢复默认 =====
        const restoreBubbleBtn = document.getElementById('restoreBubbleBtn');
        if (restoreBubbleBtn) restoreBubbleBtn.addEventListener('click', () => {
            if (!confirm('恢复默认气泡设置？')) return;
            bubbleShape = 'round';
            bubbleUserColor = '#e8ddf2';
            bubbleAngleColor = '#f3eef8';
            bubbleRadius = 18;
            bubbleCustomCSS = '';
            document.getElementById('bubbleShapeSelect').value = 'round';
            document.getElementById('bubbleUserColor').value = '#e8ddf2';
            document.getElementById('bubbleAngleColor').value = '#f3eef8';
            document.getElementById('bubbleRadiusSlider').value = 18;
            document.getElementById('bubbleRadiusValue').textContent = '18px';
            document.getElementById('bubbleCustomCSS').value = '';
            // 同步到主题变量
            document.documentElement.style.setProperty('--bubble-user', '#e8ddf2');
            document.documentElement.style.setProperty('--bubble-angle', '#f3eef8');
            applyBubbleStyle();
            saveAppearance();
            showToast('气泡已恢复默认');
        });

        // ===== 气泡自定义 CSS 应用/清空 =====
        const applyBubbleCSSBtn = document.getElementById('applyBubbleCSSBtn');
        if (applyBubbleCSSBtn) applyBubbleCSSBtn.addEventListener('click', () => {
            bubbleCustomCSS = document.getElementById('bubbleCustomCSS').value;
            applyBubbleStyle();
            saveAppearance();
            showToast('自定义 CSS 已应用');
        });
        const clearBubbleCSSBtn = document.getElementById('clearBubbleCSSBtn');
        if (clearBubbleCSSBtn) clearBubbleCSSBtn.addEventListener('click', () => {
            document.getElementById('bubbleCustomCSS').value = '';
            bubbleCustomCSS = '';
            applyBubbleStyle();
            saveAppearance();
            showToast('自定义 CSS 已清空');
        });

        // ===== 背景&字体：颜色与主题外观互通 =====
        const bgColorInputEl = document.getElementById('bgColorInput');
        const applyBgColorBtnEl = document.getElementById('applyBgColorBtn');
        if (bgColorInputEl && applyBgColorBtnEl) {
            applyBgColorBtnEl.addEventListener('click', () => {
                bgColor = bgColorInputEl.value;
                // 同步到主题外观的 --bg-chat 变量
                document.documentElement.style.setProperty('--bg-chat', bgColor);
                // 同步主题外观的聊天背景颜色输入
                const tEl = document.getElementById('themeBgChatInput');
                if (tEl) tEl.value = bgColor;
                applyBubbleStyle();
                saveAppearance();
                saveCurrentThemeToStorage();
                showToast('背景颜色已应用');
            });
            // 主题外观的聊天背景变化时同步到这里
            const themeBgChatInput = document.getElementById('themeBgChatInput');
            if (themeBgChatInput) {
                themeBgChatInput.addEventListener('input', () => {
                    bgColor = themeBgChatInput.value;
                    bgColorInputEl.value = bgColor;
                    applyBubbleStyle();
                    saveAppearance();
                });
            }
        }

        // ===== 背景&字体：本地上传图片 =====
        const bgImageUploadBtn = document.getElementById('bgImageUploadBtn');
        const bgImageFile = document.getElementById('bgImageFile');
        if (bgImageUploadBtn && bgImageFile) {
            bgImageUploadBtn.addEventListener('click', () => bgImageFile.click());
            bgImageFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
                    showToast('仅支持 JPG / PNG 格式');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    bgImage = ev.target.result;
                    document.getElementById('bgImageInput').value = '(本地上传)';
                    applyBubbleStyle();
                    saveAppearance();
                    showToast('背景图片已应用');
                };
                reader.readAsDataURL(file);
            });
        }

        // ===== 背景&字体：字体上传 =====
        const fontUploadBtn = document.getElementById('fontUploadBtn');
        const fontFile = document.getElementById('fontFile');
        if (fontUploadBtn && fontFile) {
            fontUploadBtn.addEventListener('click', () => fontFile.click());
            fontFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
                    showToast('仅支持 .ttf / .otf / .woff / .woff2');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    // 注入 @font-face
                    const fontName = 'CustomFont_' + Date.now();
                    let fontFaceStyle = document.getElementById('customFontFace');
                    if (!fontFaceStyle) {
                        fontFaceStyle = document.createElement('style');
                        fontFaceStyle.id = 'customFontFace';
                        document.head.appendChild(fontFaceStyle);
                    }
                    fontFaceStyle.textContent = '@font-face { font-family: "' + fontName + '"; src: url(' + ev.target.result + '); }';
                    customFontName = file.name;
                    customFontFamily = fontName;
                    fontFamily = fontName;
                    // 添加到下拉
                    const existing = Array.from(fontFamilySelect.options).find(o => o.value === fontName);
                    if (!existing) {
                        const opt = document.createElement('option');
                        opt.value = fontName;
                        opt.textContent = '自定义: ' + file.name;
                        fontFamilySelect.appendChild(opt);
                    }
                    fontFamilySelect.value = fontName;
                    document.getElementById('customFontName').textContent = '已上传: ' + file.name;
                    applyBubbleStyle();
                    saveAppearance();
                    showToast('字体已加载: ' + file.name);
                };
                reader.readAsDataURL(file);
            });
        }

        // ===== 系统/手机字体加载 =====
        const applySystemFontBtn = document.getElementById('applySystemFontBtn');
        if (applySystemFontBtn) applySystemFontBtn.addEventListener('click', () => {
            const input = document.getElementById('systemFontInput');
            let v = input.value.trim();
            if (!v) { showToast('请输入字体名称'); return; }
            // 包装字体名
            const fontVal = "'" + v.replace(/'/g, '') + "', sans-serif";
            // 添加到下拉
            const existing = Array.from(fontFamilySelect.options).find(o => o.value === fontVal);
            if (!existing) {
                const opt = document.createElement('option');
                opt.value = fontVal;
                opt.textContent = '系统: ' + v;
                fontFamilySelect.appendChild(opt);
            }
            fontFamilySelect.value = fontVal;
            fontFamily = fontVal;
            customFontName = '系统: ' + v;
            customFontFamily = '';
            // 清除文件上传注入的 @font-face（系统字体不需要）
            const ffs = document.getElementById('customFontFace');
            if (ffs) ffs.textContent = '';
            document.getElementById('customFontName').textContent = '系统字体: ' + v;
            applyBubbleStyle();
            saveAppearance();
            showToast('系统字体已应用: ' + v);
        });

        // 移除自定义字体
        const removeCustomFontBtn = document.getElementById('removeCustomFontBtn');
        if (removeCustomFontBtn) removeCustomFontBtn.addEventListener('click', () => {
            if (!customFontName) { showToast('未上传字体'); return; }
            if (!confirm('移除自定义字体？')) return;
            const ffs = document.getElementById('customFontFace');
            if (ffs) ffs.textContent = '';
            customFontName = '';
            customFontFamily = '';
            fontFamily = "'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif";
            // 移除下拉中的自定义项（文件上传字体 + 系统字体）
            const opts = Array.from(fontFamilySelect.options);
            for (const o of opts) {
                if (o.value.startsWith('CustomFont_') || (o.textContent && o.textContent.startsWith('系统:'))) fontFamilySelect.removeChild(o);
            }
            fontFamilySelect.value = fontFamily;
            document.getElementById('customFontName').textContent = '未上传字体';
            const sfi = document.getElementById('systemFontInput');
            if (sfi) sfi.value = '';
            applyBubbleStyle();
            saveAppearance();
            showToast('自定义字体已移除');
        });

        // ===== 背景&字体：恢复默认 =====
        const restoreBgFontBtn = document.getElementById('restoreBgFontBtn');
        if (restoreBgFontBtn) restoreBgFontBtn.addEventListener('click', () => {
            if (!confirm('恢复默认背景&字体？')) return;
            bgColor = '#fcfaff';
            bgImage = '';
            fontSize = 14;
            fontFamily = "'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif";
            document.getElementById('bgColorInput').value = bgColor;
            document.getElementById('bgImageInput').value = '';
            document.getElementById('fontSizeSlider').value = 14;
            document.getElementById('fontSizeValue').textContent = '14px';
            // 清除自定义字体（文件上传 + 系统字体）
            const ffs = document.getElementById('customFontFace');
            if (ffs) ffs.textContent = '';
            customFontName = '';
            customFontFamily = '';
            const opts = Array.from(fontFamilySelect.options);
            for (const o of opts) {
                if (o.value.startsWith('CustomFont_') || (o.textContent && o.textContent.startsWith('系统:'))) fontFamilySelect.removeChild(o);
            }
            fontFamilySelect.value = fontFamily;
            document.getElementById('customFontName').textContent = '未上传字体';
            const sfi = document.getElementById('systemFontInput');
            if (sfi) sfi.value = '';
            // 同步主题外观
            document.documentElement.style.setProperty('--bg-chat', bgColor);
            const tEl = document.getElementById('themeBgChatInput');
            if (tEl) tEl.value = bgColor;
            applyBubbleStyle();
            saveAppearance();
            saveCurrentThemeToStorage();
            showToast('背景&字体已恢复默认');
        });

        // ===== 昵称设置：双向称呼 =====
        const addUserCallAngleBtn = document.getElementById('addUserCallAngleBtn');
        if (addUserCallAngleBtn) addUserCallAngleBtn.addEventListener('click', () => {
            const input = document.getElementById('newUserCallAngle');
            const v = input.value.trim();
            if (!v) return;
            if (!userCallsAngle.includes(v)) userCallsAngle.push(v);
            input.value = '';
            renderCallLists();
            saveAppearance();
        });
        const addAngleCallUserBtn = document.getElementById('addAngleCallUserBtn');
        if (addAngleCallUserBtn) addAngleCallUserBtn.addEventListener('click', () => {
            const input = document.getElementById('newAngleCallUser');
            const v = input.value.trim();
            if (!v) return;
            if (!angleCallsUser.includes(v)) angleCallsUser.push(v);
            input.value = '';
            renderCallLists();
            saveAppearance();
        });
        // 删除称呼 chip
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('del') && e.target.dataset.dir) {
                const idx = parseInt(e.target.dataset.idx);
                if (e.target.dataset.dir === 'u2a') userCallsAngle.splice(idx, 1);
                else if (e.target.dataset.dir === 'a2u') angleCallsUser.splice(idx, 1);
                renderCallLists();
                saveAppearance();
            }
        });

        // 自定义气泡 CSS 内容（变量已在前面声明）

        function applyBubbleStyle() {
            const style = document.getElementById('appDynamicStyle') || (() => {
                const s = document.createElement('style');
                s.id = 'appDynamicStyle';
                document.head.appendChild(s);
                return s;
            })();
            const radius = Math.max(0, bubbleRadius);
            // 形状明显化：square=全直角, sharp=尖角(小圆角+三角尖尾), round=全圆角
            let mainRadius, tailRadius, sharpExtra = '';
            if (bubbleShape === 'square') {
                mainRadius = '0'; tailRadius = '0';
                sharpExtra = '.message .msg-bubble::after, .preview-user::after, .preview-angle::after { display: none !important; }';
            } else if (bubbleShape === 'sharp') {
                mainRadius = Math.max(0, Math.floor(radius * 0.4 + 2)) + 'px';
                tailRadius = '0';
                sharpExtra = `
                .message.user .msg-bubble { position: relative; }
                .message.system .msg-bubble { position: relative; }
                .message.user .msg-bubble::after { content:''; position:absolute; bottom:0; right:-7px; width:0; height:0; border-style:solid; border-width:0 0 8px 8px; border-color:transparent transparent transparent var(--bubble-user); display:block; }
                .message.system .msg-bubble::after { content:''; position:absolute; bottom:0; left:-7px; width:0; height:0; border-style:solid; border-width:0 8px 8px 0; border-color:transparent var(--bubble-angle) transparent transparent; display:block; }
                .preview-user::after { content:''; position:absolute; bottom:0; right:-6px; width:0; height:0; border-style:solid; border-width:0 0 7px 7px; border-color:transparent transparent transparent var(--bubble-user); display:block; }
                .preview-angle::after { content:''; position:absolute; bottom:0; left:-6px; width:0; height:0; border-style:solid; border-width:0 7px 7px 0; border-color:transparent var(--bubble-angle) transparent transparent; display:block; }
                .preview-bubble { position: relative; }
                `;
            } else {
                mainRadius = radius + 'px'; tailRadius = Math.max(2, Math.floor(radius/4)) + 'px';
                sharpExtra = '.message .msg-bubble::after, .preview-user::after, .preview-angle::after { display: none !important; }';
            }
            const css = `
                .message.user .msg-bubble {
                    border-radius: ${mainRadius};
                    border-bottom-right-radius: ${tailRadius};
                }
                .message.system .msg-bubble {
                    border-radius: ${mainRadius};
                    border-bottom-left-radius: ${tailRadius};
                }
                ${sharpExtra}
                .chat-box { background:${bgImage ? 'transparent' : 'var(--bg-chat)'}; ${bgImage ? `background-image:url('${bgImage}'); background-size:cover; background-position:center; background-attachment:fixed;` : ''} }
                .message { font-size:${fontSize}px; font-family:${fontFamily}; }
                /* 同步预览区 */
                .preview-user { border-radius: ${mainRadius}; border-bottom-right-radius: ${tailRadius}; }
                .preview-angle { border-radius: ${mainRadius}; border-bottom-left-radius: ${tailRadius}; }
            `;
            style.textContent = css + (bubbleCustomCSS ? '\n' + bubbleCustomCSS : '');
        }

        function loadAppearance() {
            const saved = localStorage.getItem('dream_appearance');
            if (saved) {
                try {
                    const a = JSON.parse(saved);
                    bubbleShape = a.bubbleShape || bubbleShape;
                    bubbleUserColor = a.bubbleUserColor || bubbleUserColor;
                    bubbleAngleColor = a.bubbleAngleColor || bubbleAngleColor;
                    bubbleRadius = a.bubbleRadius || bubbleRadius;
                    bgColor = a.bgColor || bgColor;
                    bgImage = a.bgImage || '';
                    fontSize = a.fontSize || fontSize;
                    fontFamily = a.fontFamily || fontFamily;
                    themeAccent = a.themeAccent || themeAccent;
                    chatReplySpeed = a.chatReplySpeed != null ? a.chatReplySpeed : chatReplySpeed;
                    replyDelayMin = a.replyDelayMin != null ? a.replyDelayMin : replyDelayMin;
                    replyDelayMax = a.replyDelayMax != null ? a.replyDelayMax : replyDelayMax;
                    autoSendEnabled = a.autoSendEnabled != null ? a.autoSendEnabled : autoSendEnabled;
                    autoSendInterval = a.autoSendInterval != null ? a.autoSendInterval : autoSendInterval;
                    patDblClickEnabled = a.patDblClickEnabled != null ? a.patDblClickEnabled : patDblClickEnabled;
                    patUserInterval = a.patUserInterval != null ? a.patUserInterval : patUserInterval;
                    patAngleInterval = a.patAngleInterval != null ? a.patAngleInterval : patAngleInterval;
                    patAngleReplyChance = a.patAngleReplyChance != null ? a.patAngleReplyChance : patAngleReplyChance;
                    chatTypingEnabled = a.chatTypingEnabled != null ? a.chatTypingEnabled : chatTypingEnabled;
                    quickPats = Array.isArray(a.quickPats) ? a.quickPats : quickPats;
                    if (a.patGroups && typeof a.patGroups === 'object') patGroups = a.patGroups;
                    if (Array.isArray(a.patGroupList)) patGroupList = a.patGroupList;
                    chatPickMode = a.chatPickMode || chatPickMode;
                    chatShowTimestamp = a.chatShowTimestamp != null ? a.chatShowTimestamp : chatShowTimestamp;
                    chatShowAvatar = a.chatShowAvatar != null ? a.chatShowAvatar : chatShowAvatar;
                    bubbleCustomCSS = a.bubbleCustomCSS || '';
                    customFontName = a.customFontName || '';
                    customFontFamily = a.customFontFamily || '';
                    userCallsAngle = a.userCallsAngle || [];
                    angleCallsUser = a.angleCallsUser || [];
                    chatShowNickname = a.chatShowNickname != null ? a.chatShowNickname : chatShowNickname;
                    chatQuoteEnabled = a.chatQuoteEnabled != null ? a.chatQuoteEnabled : chatQuoteEnabled;
                    chatReadReceipt = a.chatReadReceipt != null ? a.chatReadReceipt : chatReadReceipt;
                    chatReadStyle = a.chatReadStyle || chatReadStyle;
                    chatReadNoReply = a.chatReadNoReply != null ? a.chatReadNoReply : chatReadNoReply;
                    chatEnterSend = a.chatEnterSend != null ? a.chatEnterSend : chatEnterSend;
                    chatTimestampStyle = a.chatTimestampStyle || chatTimestampStyle;
                    chatCallEnabled = a.chatCallEnabled != null ? a.chatCallEnabled : chatCallEnabled;
                    chatLetterEnabled = a.chatLetterEnabled != null ? a.chatLetterEnabled : chatLetterEnabled;
                    chatCustomReplyRule = a.chatCustomReplyRule != null ? a.chatCustomReplyRule : chatCustomReplyRule;
                    chatMergeCards = a.chatMergeCards != null ? a.chatMergeCards : chatMergeCards;
                    chatMergeCount = (a.chatMergeCount != null && a.chatMergeCount >= 2 && a.chatMergeCount <= 10) ? a.chatMergeCount : chatMergeCount;
                    chatEmojiMix = a.chatEmojiMix != null ? a.chatEmojiMix : chatEmojiMix;
                    chatKaomojiMix = a.chatKaomojiMix != null ? a.chatKaomojiMix : chatKaomojiMix;
                    chatSoundMsg = a.chatSoundMsg != null ? a.chatSoundMsg : chatSoundMsg;
                    chatSoundCall = a.chatSoundCall != null ? a.chatSoundCall : chatSoundCall;
                    chatVolume = a.chatVolume != null ? a.chatVolume : chatVolume;
                    angleCallChance = a.angleCallChance != null ? a.angleCallChance : angleCallChance;
                    chatLetterMin = a.chatLetterMin != null ? a.chatLetterMin : chatLetterMin;
                    chatLetterMinUnit = a.chatLetterMinUnit || chatLetterMinUnit;
                    chatLetterMax = a.chatLetterMax != null ? a.chatLetterMax : chatLetterMax;
                    chatLetterMaxUnit = a.chatLetterMaxUnit || chatLetterMaxUnit;
                    chatReplyMin = a.chatReplyMin != null ? a.chatReplyMin : chatReplyMin;
                    chatReplyMinUnit = a.chatReplyMinUnit || chatReplyMinUnit;
                    chatReplyMax = a.chatReplyMax != null ? a.chatReplyMax : chatReplyMax;
                    chatReplyMaxUnit = a.chatReplyMaxUnit || chatReplyMaxUnit;
                    chatReplyMinSent = a.chatReplyMinSent != null ? a.chatReplyMinSent : chatReplyMinSent;
                    chatReplyMaxSent = a.chatReplyMaxSent != null ? a.chatReplyMaxSent : chatReplyMaxSent;
                    favorites = a.favorites && typeof a.favorites === 'object' ? a.favorites : { usr: [], angle: [] };
                    if (!favorites.usr) favorites.usr = []; if (!favorites.angle) favorites.angle = [];
                    marks = a.marks && typeof a.marks === 'object' ? a.marks : { usr: [], angle: [] };
                    if (!marks.usr) marks.usr = []; if (!marks.angle) marks.angle = [];
                    recalledCache = a.recalledCache && typeof a.recalledCache === 'object' ? a.recalledCache : {};
                    moodDiaries = a.moodDiaries && typeof a.moodDiaries === 'object' ? a.moodDiaries : {};
                    kaomojiGroups = a.kaomojiGroups && typeof a.kaomojiGroups === 'object' ? a.kaomojiGroups : { default: [...DEFAULT_KAOMOJIS] };
                    // 一次性迁移：之前错误地把 DEFAULT_EMOJIS（全 emoji）存进了 kaomojiGroups.default，
                    // 检测到第一个元素不含颜文字特征（无括号/≧/T_T）就自动替换，刷新一次即可生效
                    try {
                        var kdef = kaomojiGroups.default || [];
                        var looksLikeEmoji = kdef.length && /^[^\(\)≧≦_T].{0,10}$/.test(kdef[0]) && !/\(/.test(kdef[0]);
                        if (looksLikeEmoji) {
                            kaomojiGroups = { default: [...DEFAULT_KAOMOJIS] };
                            saveAppearance();
                        }
                    } catch(_e) {}
                    kaomojiGroupList = Array.isArray(a.kaomojiGroupList) ? a.kaomojiGroupList : ['default'];
                    emojiImgGroups = a.emojiImgGroups && typeof a.emojiImgGroups === 'object' ? a.emojiImgGroups : { default: [] };
                    emojiImgGroupList = Array.isArray(a.emojiImgGroupList) ? a.emojiImgGroupList : ['default'];
                    if (a.letterBox && typeof a.letterBox === 'object') {
                        letterBox.mine  = a.letterBox.mine  || { inbox: [], outbox: [] };
                        letterBox.angle = a.letterBox.angle || { inbox: [], outbox: [] };
                        letterBox.space = a.letterBox.space || { inbox: [] };
                        if (!letterBox.mine.inbox) letterBox.mine.inbox = [];
                        if (!letterBox.mine.outbox) letterBox.mine.outbox = [];
                        if (!letterBox.angle.inbox) letterBox.angle.inbox = [];
                        if (!letterBox.angle.outbox) letterBox.angle.outbox = [];
                        if (!letterBox.space.inbox) letterBox.space.inbox = [];
                    }
                    // 留言板
                    if (a.messageBoard && typeof a.messageBoard === 'object') {
                        messageBoard.notes = Array.isArray(a.messageBoard.notes) ? a.messageBoard.notes : [];
                        messageBoard.lastDate = a.messageBoard.lastDate || '';
                        messageBoard.history = (a.messageBoard.history && typeof a.messageBoard.history === 'object') ? a.messageBoard.history : {};
                        messageBoard.phrases = Array.isArray(a.messageBoard.phrases) && a.messageBoard.phrases.length ? a.messageBoard.phrases : [...DEFAULT_BOARD_PHRASES];
                    } else {
                        messageBoard.phrases = [...DEFAULT_BOARD_PHRASES];
                    }
                    // 许愿树
                    if (a.wishTree && typeof a.wishTree === 'object') {
                        wishTree.stars = Array.isArray(a.wishTree.stars) ? a.wishTree.stars : [];
                        wishTree.lastDate = a.wishTree.lastDate || '';
                        wishTree.history = (a.wishTree.history && typeof a.wishTree.history === 'object') ? a.wishTree.history : {};
                        var _wp = a.wishTree.phrases && typeof a.wishTree.phrases === 'object' ? a.wishTree.phrases : {};
                        ['yellow','pink','blue','red','green','purple'].forEach(function(c){
                            wishTree.phrases[c] = (Array.isArray(_wp[c]) && _wp[c].length) ? _wp[c] : [...DEFAULT_WISH_PHRASES[c]];
                        });
                    } else {
                        ['yellow','pink','blue','red','green','purple'].forEach(function(c){
                            wishTree.phrases[c] = [...DEFAULT_WISH_PHRASES[c]];
                        });
                    }
                    // 游戏数据
                    if (a.dreamGames && typeof a.dreamGames === 'object') {
                        dreamGames = Object.assign(dreamGames, a.dreamGames);
                        if (!Array.isArray(dreamGames.rps_history)) dreamGames.rps_history = [];
                        if (!dreamGames.rps_stats || typeof dreamGames.rps_stats !== 'object') dreamGames.rps_stats = {dreamerWins:0, angleWins:0, ties:0};
                        if (!Array.isArray(dreamGames.doodles)) dreamGames.doodles = [];
                        if (!Array.isArray(dreamGames.draw_guess_history)) dreamGames.draw_guess_history = [];
                        if (!dreamGames.draw_guess_topics || typeof dreamGames.draw_guess_topics !== 'object') dreamGames.draw_guess_topics = {};
                        if (!dreamGames.wallet || typeof dreamGames.wallet !== 'object') dreamGames.wallet = {dreamer:888.88, angle:888.88};
                        if (typeof dreamGames.wallet.dreamer !== 'number') dreamGames.wallet.dreamer = 888.88;
                        if (typeof dreamGames.wallet.angle !== 'number') dreamGames.wallet.angle = 888.88;
                        if (!Array.isArray(dreamGames.red_packet_history)) dreamGames.red_packet_history = [];
                    }
                    // 多角色 / 群聊
                    if (Array.isArray(a.roles) && a.roles.length) {
                        roles = a.roles;
                    }
                    if (a.currentRoleId) currentRoleId = a.currentRoleId;
                    // 确保每个角色有必要字段
                    roles.forEach(function(r){
                        if (!r.chatSnapshots) r.chatSnapshots = [];
                        if (r.isGroup === undefined) r.isGroup = false;
                        if (!r.memberIds) r.memberIds = [];
                        if (!r.color) r.color = '#c6a8de';
                        if (!Array.isArray(r.personalCards)) r.personalCards = [];
                    });
                    if (!roles.find(function(r){ return r.id === currentRoleId; })) currentRoleId = roles[0].id;
                    // 梦角状态
                    if (Array.isArray(a.angleStatuses) && a.angleStatuses.length) {
                        angleStatuses = a.angleStatuses;
                    }
                    if (a.currentAngleStatus && angleStatuses.indexOf(a.currentAngleStatus) >= 0) {
                        currentAngleStatus = a.currentAngleStatus;
                    } else if (angleStatuses.length) {
                        currentAngleStatus = angleStatuses[0];
                    }
                } catch (e) {}
            }
            // 首次加载（无存档）或异常时，确保默认话语库已注入
            if (!Array.isArray(messageBoard.phrases) || !messageBoard.phrases.length) {
                messageBoard.phrases = [...DEFAULT_BOARD_PHRASES];
            }
            ['yellow','pink','blue','red','green','purple'].forEach(function(c){
                if (!Array.isArray(wishTree.phrases[c]) || !wishTree.phrases[c].length) {
                    wishTree.phrases[c] = [...DEFAULT_WISH_PHRASES[c]];
                }
            });
            // 同步表单
            bubbleShapeSelect.value = bubbleShape;
            bubbleUserColorInput.value = bubbleUserColor;
            bubbleAngleColorInput.value = bubbleAngleColor;
            bubbleRadiusSlider.value = bubbleRadius;
            bubbleRadiusValue.textContent = bubbleRadius + 'px';
            bgColorInput.value = bgColor;
            bgImageInput.value = bgImage;
            fontSizeSlider.value = fontSize;
            fontSizeValue.textContent = fontSize + 'px';
            fontFamilySelect.value = fontFamily;
            // 同步自定义 CSS
            const cssTA = document.getElementById('bubbleCustomCSS');
            if (cssTA) cssTA.value = bubbleCustomCSS;
            // 同步自定义字体
            const cfn = document.getElementById('customFontName');
            if (cfn) cfn.textContent = customFontName ? (customFontName.startsWith('系统:') ? customFontName : ('已上传: ' + customFontName)) : '未上传字体';
            if (customFontFamily && fontFamilySelect) {
                // 文件上传字体：添加自定义字体选项（注意：DataURL 在重载后丢失，需重新上传）
                const existing = Array.from(fontFamilySelect.options).find(o => o.value === customFontFamily);
                if (!existing) {
                    const opt = document.createElement('option');
                    opt.value = customFontFamily;
                    opt.textContent = '自定义: ' + customFontName;
                    fontFamilySelect.appendChild(opt);
                }
                fontFamilySelect.value = customFontFamily;
            } else if (customFontName && customFontName.startsWith('系统:') && fontFamilySelect) {
                // 系统字体：重新添加下拉选项
                const existing = Array.from(fontFamilySelect.options).find(o => o.value === fontFamily);
                if (!existing) {
                    const opt = document.createElement('option');
                    opt.value = fontFamily;
                    opt.textContent = customFontName;
                    fontFamilySelect.appendChild(opt);
                }
                fontFamilySelect.value = fontFamily;
                const sfi = document.getElementById('systemFontInput');
                if (sfi) sfi.value = customFontName.replace(/^系统:\s*/, '');
            }
            // 渲染称呼列表
            renderCallLists();
            // 同步聊天节奏滑块
            const syncSlider = (id, val, valId, fmt) => {
                const el = document.getElementById(id);
                const ve = document.getElementById(valId);
                if (el) el.value = val;
                if (ve) ve.textContent = fmt ? fmt(val) : val;
            };
            syncSlider('chatMinWaitSlider', replyDelayMin, 'chatMinWaitVal', v => (v >= 60000 ? (v/60000).toFixed(1)+'分钟' : (v/1000).toFixed(0)+'s'));
            syncSlider('chatMaxWaitSlider', replyDelayMax, 'chatMaxWaitVal', v => (v >= 60000 ? (v/60000).toFixed(1)+'分钟' : (v/1000).toFixed(0)+'s'));
            syncSlider('chatActiveIntervalSlider', autoSendInterval, 'chatActiveIntervalVal', v => v + '分钟');
            const asmEl = document.getElementById('chatActiveMsg');
            if (asmEl) asmEl.checked = autoSendEnabled;
            const pdeEl = document.getElementById('patDblClickEnabled');
            if (pdeEl) pdeEl.checked = patDblClickEnabled;
            const cteEl = document.getElementById('chatTypingEnabled');
            if (cteEl) cteEl.checked = chatTypingEnabled;
            syncSlider('patUserIntervalSlider', patUserInterval, 'patUserIntervalVal', v => (v/1000).toFixed(1)+'s');
            syncSlider('patAngleIntervalSlider', patAngleInterval, 'patAngleIntervalVal', v => (v >= 60000 ? (v/60000).toFixed(1)+'分钟' : (v/1000).toFixed(1)+'s'));
            syncSlider('patAngleReplyChanceSlider', patAngleReplyChance, 'patAngleReplyChanceVal', v => v + '%');
            // 同步聊天设置 checkbox & 选项卡
            const cbSync = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
            cbSync('chatQuoteEnabled', chatQuoteEnabled);
            cbSync('chatReadReceipt', chatReadReceipt);
            cbSync('chatReadNoReply', chatReadNoReply);
            cbSync('chatEnterSend', chatEnterSend);
            cbSync('chatShowNickname', chatShowNickname);
            cbSync('chatShowAvatar', chatShowAvatar);
            cbSync('chatShowTimestamp', chatShowTimestamp);
            cbSync('chatCallEnabled', chatCallEnabled);
            cbSync('chatLetterEnabled', chatLetterEnabled);
            cbSync('chatCustomReplyRule', chatCustomReplyRule);
            cbSync('chatMergeCards', chatMergeCards);
            cbSync('chatEmojiMix', chatEmojiMix);
            cbSync('chatKaomojiMix', chatKaomojiMix);
            cbSync('chatSoundMsg', chatSoundMsg);
            cbSync('chatSoundCall', chatSoundCall);
            document.querySelectorAll('#chatTimestampOptions .ts-option').forEach(o => {
                o.classList.toggle('active', o.dataset.val === chatTimestampStyle);
            });
            document.querySelectorAll('#chatReceiptStyle .style-option').forEach(o => {
                o.classList.toggle('active', o.dataset.val === chatReadStyle);
            });
            const cpm = document.getElementById('chatPickModeSelect');
            if (cpm) cpm.value = chatPickMode;
            syncSlider('angleCallChanceSlider', angleCallChance, 'angleCallChanceVal', v => v + '%');
            syncSlider('chatVolumeSlider', chatVolume, 'chatVolumeVal', v => v + '%');
            syncSlider('chatLetterMinSlider', chatLetterMin, 'chatLetterMinVal', v => v + (chatLetterMinUnit === 'day' ? '天' : (chatLetterMinUnit === 'minute' || chatLetterMinUnit === 'min' ? '分钟' : '小时')));
            syncSlider('chatLetterMaxSlider', chatLetterMax, 'chatLetterMaxVal', v => v + (chatLetterMaxUnit === 'day' ? '天' : (chatLetterMaxUnit === 'minute' || chatLetterMaxUnit === 'min' ? '分钟' : '小时')));
            syncSlider('chatReplyMinSlider', chatReplyMin, 'chatReplyMinVal', v => v + (chatReplyMinUnit === 'hour' ? '小时' : '分钟'));
            syncSlider('chatReplyMaxSlider', chatReplyMax, 'chatReplyMaxVal', v => v + (chatReplyMaxUnit === 'hour' ? '小时' : '分钟'));
            const selSync = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
            selSync('chatLetterMinUnit', chatLetterMinUnit);
            selSync('chatLetterMaxUnit', chatLetterMaxUnit);
            selSync('chatReplyMinUnit', chatReplyMinUnit);
            selSync('chatReplyMaxUnit', chatReplyMaxUnit);
            applyBubbleStyle();
            // 重启主动发送定时器
            restartAutoSendTimer();
            // 渲染快捷拍一拍
            renderQuickPatChips();
        }
        function saveAppearance() {
            const data = {
                bubbleShape, bubbleUserColor, bubbleAngleColor, bubbleRadius,
                bgColor, bgImage, fontSize, fontFamily, themeAccent,
                chatReplySpeed, replyDelayMin, replyDelayMax,
                autoSendEnabled, autoSendInterval,
                patDblClickEnabled, patUserInterval, patAngleInterval, patAngleReplyChance,
                chatTypingEnabled,
                quickPats,
                patGroups, patGroupList,
                chatPickMode, chatShowTimestamp, chatShowAvatar,
                bubbleCustomCSS, customFontName, customFontFamily,
                userCallsAngle, angleCallsUser,
                chatShowNickname, chatQuoteEnabled, chatReadReceipt, chatReadStyle, chatReadNoReply,
                chatEnterSend, chatTimestampStyle, chatCallEnabled, chatLetterEnabled, chatCustomReplyRule,
                chatMergeCards, chatMergeCount, chatEmojiMix, chatKaomojiMix, chatSoundMsg, chatSoundCall, chatVolume,
                angleCallChance,
                chatLetterMin, chatLetterMinUnit, chatLetterMax, chatLetterMaxUnit,
                chatReplyMin, chatReplyMinUnit, chatReplyMax, chatReplyMaxUnit,
                chatReplyMinSent, chatReplyMaxSent,
                favorites, marks, recalledCache, moodDiaries,
                kaomojiGroups, kaomojiGroupList,
                emojiImgGroups, emojiImgGroupList,
                letterBox,
                messageBoard, wishTree,
                dreamGames,
                roles, currentRoleId,
                angleStatuses, currentAngleStatus
            };
            localStorage.setItem('dream_appearance', JSON.stringify(data));
            applyBubbleStyle();
        }

        // ===== 数据管理：导出 / 导入 / 清空 =====
        function exportData() {
            // 先保存当前内存中的最新数据到 localStorage，确保导出内容是最新的
            try { saveAppearance(); } catch (e) {}
            try { saveFullProfile(); } catch (e) {}
            const payload = {
                profile: JSON.parse(localStorage.getItem('dream_profile') || '{}'),
                appearance: JSON.parse(localStorage.getItem('dream_appearance') || '{}'),
                cards: { groups, groupList, cardLibrary },
                emojis: { groups: emojiGroups, groupList: emojiGroupList },
                pats: { groups: patGroups, groupList: patGroupList },
                // 其他板块数据（也包含在 appearance 中，此处顶层列出便于查看）
                favorites,
                marks,
                moodDiaries,
                kaomojiGroups,
                kaomojiGroupList,
                emojiImgGroups,
                emojiImgGroupList,
                letterBox,
                messageBoard,
                wishTree,
                dreamGames,
                roles,
                currentRoleId,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            dataExportAnchor.href = url;
            dataExportAnchor.download = `lingstar-backup-${Date.now()}.json`;
            dataExportAnchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast('已导出数据');
        }
        function importDataFromFile() {
            dataImportFile.click();
        }
        function handleImportFile(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const raw = evt.target.result;
                let payload;
                try { payload = JSON.parse(raw); }
                catch (err) { alert('JSON 解析失败：' + err.message); return; }
                showConfirm('导入数据', '导入将覆盖当前所有数据，确定？').then(function(ok){
                    if (!ok) return;
                    try {
                        if (payload.profile) localStorage.setItem('dream_profile', JSON.stringify(payload.profile));
                        if (payload.appearance) localStorage.setItem('dream_appearance', JSON.stringify(payload.appearance));
                        if (payload.cards) {
                            groups = payload.cards.groups || { default: [...DEFAULT_CARDS] };
                            groupList = payload.cards.groupList || ['default'];
                            cardLibrary = payload.cards.cardLibrary || (() => { let a = []; for (const g in groups) a = a.concat(groups[g]); return a; })();
                        }
                        if (payload.emojis) {
                            emojiGroups = payload.emojis.groups || { default: [...DEFAULT_KAOMOJIS] };
                            emojiGroupList = payload.emojis.groupList || ['default'];
                        }
                        if (payload.pats) {
                            patGroups = payload.pats.groups || { default: [...DEFAULT_PATS] };
                            patGroupList = payload.pats.groupList || ['default'];
                        }
                        loadProfile();
                        loadAppearance();
                        renderCards(); renderEmojis(); renderPats(); renderStatuses();
                        showToast('数据导入成功');
                    } catch (err) {
                        alert('导入失败：' + err.message);
                    }
                });
            };
            reader.onerror = function() { alert('读取文件失败'); };
            reader.readAsText(file);
            e.target.value = '';
        }
        function clearAllData() {
            if (!confirm('确定清空所有本地数据？此操作不可恢复！')) return;
            localStorage.removeItem('dream_profile');
            localStorage.removeItem('dream_appearance');
            groups = { default: [...DEFAULT_CARDS] };
            groupList = ['default'];
            cardLibrary = [...DEFAULT_CARDS];
            currentGroup = 'all';
            cardSelected.clear();
            cardSelectMode = false;

            emojiGroups = { default: [...DEFAULT_KAOMOJIS] };
            emojiGroupList = ['default'];
            emojiCurrentGroup = 'all';
            emojiSelected.clear();
            emojiSelectMode = false;

            patGroups = { default: [...DEFAULT_PATS] };
            patGroupList = ['default'];
            patCurrentGroup = 'all';
            patSelected.clear();
            patSelectMode = false;

            // 重置外观/聊天设置为默认
            userName = '我'; userAvatar = '🌸'; angleName = 'ta'; angleAvatar = '🌙';
            avatarShape = 'circle'; userSize = 60; userLeft = 0; userTop = 0;
            angleSize = 60; angleLeft = 0; angleTop = 0;
            chatReplySpeed = 300; chatPickMode = 'random';
            replyDelayMin = 3000; replyDelayMax = 7000;
            autoSendEnabled = true; autoSendInterval = 5;
            patDblClickEnabled = true; patUserInterval = 500;
            patAngleInterval = 5000; patAngleReplyChance = 30;
            chatTypingEnabled = true;
            chatShowTimestamp = true; chatShowAvatar = true;
            chatShowNickname = true; chatQuoteEnabled = true;
            chatReadReceipt = true; chatReadStyle = 'graphic'; chatReadNoReply = true;
            chatEnterSend = false; chatTimestampStyle = 'HH:MM';
            chatCallEnabled = true; chatLetterEnabled = true; chatCustomReplyRule = false;
            chatMergeCards = false; chatMergeCount = 3; chatEmojiMix = false; chatKaomojiMix = false;
            chatSoundMsg = false; chatSoundCall = false; chatVolume = 70;
            angleCallChance = 30;
            angleStatuses = ['在线', '忙碌', '离线', '睡觉中', '想你中'];
            currentAngleStatus = '在线';
            roles = [{ id:'role_default', name:'ta', avatar:'🌙', callUser:'亲爱的', callChance:0.3, chatSnapshots:[], isGroup:false, memberIds:[], color:'#c6a8de' }];
            currentRoleId = 'role_default';
            chatLetterMin = 15; chatLetterMinUnit = 'minute';
            chatLetterMax = 60; chatLetterMaxUnit = 'minute';
            chatReplyMin = 10; chatReplyMinUnit = 'min';
            chatReplyMax = 2; chatReplyMaxUnit = 'hour';
            chatReplyMinSent = 5; chatReplyMaxSent = 20;
            userCallsAngle = []; angleCallsUser = [];
            favorites = { usr: [], angle: [] };
            marks = { usr: [], angle: [] };
            recalledCache = {};
            moodDiaries = {};
            kaomojiGroups = { default: [...DEFAULT_KAOMOJIS] };
            kaomojiGroupList = ['default']; kaoCurrentGroup = 'all'; kaoSelected = new Set(); kaoSelectMode = false; kaoSearch = '';
            emojiImgGroups = { default: [] };
            emojiImgGroupList = ['default']; emImgCurrentGroup = 'all'; emImgSelected = new Set(); emImgSelectMode = false; emImgSearch = '';
            letterBox = { mine:{inbox:[],outbox:[]}, angle:{inbox:[],outbox:[]}, space:{inbox:[]} };
            quickPats = [];
            bubbleShape = 'round'; bubbleUserColor = '#e8ddf2'; bubbleAngleColor = '#f3eef8';
            bubbleRadius = 18; bgColor = '#fcfaff'; bgImage = '';
            fontSize = 14; fontFamily = "'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif";
            themeAccent = '#c6a8de';
            bubbleCustomCSS = ''; customFontName = ''; customFontFamily = '';

            loadProfile();
            loadAppearance();
            renderCards(); renderEmojis(); renderPats(); renderStatuses();
            showToast('已清空所有数据并恢复默认');
        }

        // ===== 聊天记录 JSON 批量导入 =====
        function importChatHistory() {
            const chatImportFile = document.getElementById('chatImportFile');
            if (chatImportFile) chatImportFile.click();
        }
        function handleChatImportFile(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const raw = evt.target.result;
                let data;
                try { data = JSON.parse(raw); }
                catch (err) { alert('JSON 解析失败：' + err.message); return; }
                let msgs = [];
                if (Array.isArray(data)) {
                    msgs = data;
                } else if (data && Array.isArray(data.messages)) {
                    msgs = data.messages;
                } else if (data && Array.isArray(data.chat)) {
                    msgs = data.chat;
                } else {
                    alert('JSON 格式不正确：需为消息数组或 {messages:[...]}');
                    return;
                }
                if (!msgs.length) { alert('没有可导入的消息'); return; }
                showConfirm('导入聊天记录', `将导入 ${msgs.length} 条消息到当前对话，确定？`).then(function(ok){
                    if (!ok) return;
                    let count = 0;
                    msgs.forEach(m => {
                        if (!m || typeof m !== 'object') return;
                        const type = (m.type || m.sender || 'angle');
                        const text = m.text || m.content || m.message || '';
                        if (!text) return;
                        const opts = {};
                        if (m.time) opts.ts = m.time;
                        else if (m.timestamp) opts.ts = m.timestamp;
                        else if (m.ts) opts.ts = m.ts;
                        addChatMessage(String(text), type, opts);
                        count++;
                    });
                    saveAppearance();
                    showToast(`已导入 ${count} 条聊天记录`);
                });
            };
            reader.onerror = function() { alert('读取文件失败'); };
            reader.readAsText(file);
            e.target.value = '';
        }

        function clearCurrentChat() {
            if (!confirm('确定清空当前对话的所有消息？此操作不可恢复！')) return;
            const poke = document.getElementById('pokeCenter');
            const typing = document.getElementById('typingIndicator');
            chatBox.innerHTML = '';
            if (poke) chatBox.appendChild(poke);
            if (typing) chatBox.appendChild(typing);
            const cur = getCurrentRole();
            if (cur) { cur.chatSnapshots = []; }
            saveAppearance();
            showToast('当前对话已清空');
        }

        // ===== 多角色 / 群聊 =====
        function getCurrentRole() {
            if (!roles || !roles.length) return null;
            return roles.find(function(r){ return r.id === currentRoleId; }) || roles[0];
        }

        function snapshotToRole() {
            const cur = getCurrentRole();
            if (!cur) return;
            if (!cur.chatSnapshots) cur.chatSnapshots = [];
            // 存当前所有消息 div 的 outerHTML
            const msgs = chatBox.querySelectorAll('.message');
            cur.chatSnapshots = [];
            msgs.forEach(function(m){ cur.chatSnapshots.push(m.outerHTML); });
        }

        function renderChatHistory(role) {
            // 保留 pokeCenter 和 typingIndicator，清空消息
            const poke = document.getElementById('pokeCenter');
            const typing = document.getElementById('typingIndicator');
            chatBox.innerHTML = '';
            if (poke) chatBox.appendChild(poke);
            if (typing) chatBox.appendChild(typing);
            if (!role || !role.chatSnapshots || !role.chatSnapshots.length) return;
            role.chatSnapshots.forEach(function(html){
                chatBox.insertAdjacentHTML('beforeend', html);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function switchRole(roleId) {
            const role = roles.find(function(r){ return r.id === roleId; });
            if (!role) return;
            // 保存当前聊天快照
            snapshotToRole();
            // 更新当前角色
            var oldRole = getCurrentRole();
            if (oldRole) oldRole.chatSnapshots = oldRole.chatSnapshots || [];
            currentRoleId = roleId;
            // 更新全局变量
            angleName = role.name;
            angleAvatar = role.avatar;
            if (role.callUser) angleCallsUser = [role.callUser];
            if (role.callChance !== undefined) angleCallChance = Math.round(role.callChance * 100);
            // 更新UI
            applyProfile();
            // 重建字卡库（通用 + 当前角色单人字卡）
            rebuildCardLibrary();
            // 渲染该角色聊天历史
            renderChatHistory(role);
            saveAppearance();
            showToast('已切换到 ' + role.name);
        }

        function addRole(name, avatar) {
            const id = 'role_' + Date.now() + Math.floor(Math.random()*1000);
            const colors = ['#c6a8de','#ffb3c6','#a8d8ea','#b5ead7','#ffdac1','#e0bbff','#ffc9de','#c7ceea'];
            const role = {
                id: id, name: name || '新角色', avatar: avatar || '🌟',
                callUser: '亲爱的', callChance: 0.3, chatSnapshots: [],
                isGroup: false, memberIds: [],
                color: colors[Math.floor(Math.random()*colors.length)],
                personalCards: []
            };
            roles.push(role);
            saveAppearance();
            return role;
        }

        function deleteRole(roleId) {
            if (roleId === 'role_default') { showToast('默认角色不可删除'); return; }
            const idx = roles.findIndex(function(r){ return r.id === roleId; });
            if (idx < 0) return;
            roles.splice(idx, 1);
            // 清理群聊中的成员引用
            roles.forEach(function(r){
                if (r.isGroup && r.memberIds) {
                    r.memberIds = r.memberIds.filter(function(m){ return m !== roleId; });
                }
            });
            // 如果删除的是当前角色，切换到一个有效角色
            if (currentRoleId === roleId) {
                const fallback = roles.find(function(r){ return r.id === 'role_default'; }) || roles[0];
                if (fallback) {
                    currentRoleId = fallback.id;
                    switchRole(fallback.id);
                } else {
                    currentRoleId = '';
                }
            }
            saveAppearance();
        }

        function addGroupChat(name, avatar, memberIds) {
            const id = 'group_' + Date.now() + Math.floor(Math.random()*1000);
            const role = {
                id: id, name: name || '群聊', avatar: avatar || '👥',
                callUser: '', callChance: 0, chatSnapshots: [],
                isGroup: true, memberIds: memberIds || [], color: '#a8d8ea'
            };
            roles.push(role);
            saveAppearance();
            return role;
        }

        function renderRoleSwitcher() {
            const list = document.getElementById('roleList');
            if (!list) return;
            list.innerHTML = '';
            if (!roles) roles = [];
            roles.forEach(function(role){
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--bg-card);border:1px solid var(--border-faint);cursor:pointer;transition:0.15s;';
                item.onmouseenter = function(){ item.style.transform='scale(1.01)'; };
                item.onmouseleave = function(){ item.style.transform='scale(1)'; };
                const isCurrent = role.id === currentRoleId;
                if (isCurrent) item.style.borderColor = 'var(--theme-accent,#c6a8de)';
                // 头像
                const av = document.createElement('div');
                av.style.cssText = 'width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;flex-shrink:0;background:'+(role.color||'#c6a8de')+';overflow:hidden;';
                av.innerHTML = isImageUrl(role.avatar) ? '<img src="'+role.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">' : role.avatar;
                item.appendChild(av);
                // 名称 + 类型
                const info = document.createElement('div');
                info.style.flex = '1';
                const nm = document.createElement('div');
                nm.style.cssText = 'font-size:0.85rem;font-weight:600;color:var(--text-primary);';
                nm.textContent = role.name + (role.isGroup ? ' 👥' : '');
                info.appendChild(nm);
                const sub = document.createElement('div');
                sub.style.cssText = 'font-size:0.68rem;color:var(--text-muted);';
                if (role.isGroup) {
                    const memberNames = (role.memberIds||[]).map(function(mid){
                        var mr = roles.find(function(x){ return x.id===mid; });
                        return mr ? mr.name : '?';
                    }).join('、');
                    sub.textContent = '群聊 · ' + (memberNames || '无成员') + (isCurrent ? ' · 当前' : '');
                } else {
                    sub.textContent = (role.chatSnapshots?role.chatSnapshots.length:0) + ' 条消息' + (isCurrent ? ' · 当前' : '');
                }
                info.appendChild(sub);
                item.appendChild(info);
                // 操作按钮
                var actions = document.createElement('div');
                actions.style.cssText = 'display:flex;gap:4px;';
                if (role.isGroup) {
                    var memBtn = document.createElement('button');
                    memBtn.textContent = '👤';
                    memBtn.title = '管理成员';
                    memBtn.style.cssText = 'width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;background:var(--bg-input);';
                    memBtn.onclick = function(e){ e.stopPropagation(); openGroupMemberManager(role.id); };
                    actions.appendChild(memBtn);
                }
                var delBtn = document.createElement('button');
                delBtn.textContent = '🗑';
                delBtn.title = '删除';
                delBtn.style.cssText = 'width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;background:var(--bg-input);opacity:'+(role.id==='role_default'?'0.3':'1')+';';
                delBtn.onclick = function(e){
                    e.stopPropagation();
                    if (role.id === 'role_default') { showToast('默认角色不可删除'); return; }
                    showConfirm('删除角色', '确定删除「'+escapeHtml(role.name)+'」？聊天记录也会一并清除。').then(function(ok){
                        if (ok) {
                            deleteRole(role.id);
                            renderRoleSwitcher();
                        }
                    });
                };
                actions.appendChild(delBtn);
                item.appendChild(actions);
                // 点击切换
                item.onclick = function(){
                    if (role.id !== currentRoleId) {
                        switchRole(role.id);
                    }
                    closeModal(document.getElementById('roleSwitcherModal'));
                };
                list.appendChild(item);
            });
        }

        function openGroupMemberManager(groupId) {
            var group = roles.find(function(r){ return r.id === groupId; });
            if (!group) return;
            var nonGroupRoles = roles.filter(function(r){ return !r.isGroup; });
            var html = '<div style="font-size:0.82rem;font-weight:600;margin-bottom:10px;">管理「'+group.name+'」的成员</div>';
            nonGroupRoles.forEach(function(r){
                var checked = (group.memberIds||[]).indexOf(r.id) >= 0;
                html += '<label style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;cursor:pointer;font-size:0.8rem;">'
                    + '<input type="checkbox" data-roleid="'+r.id+'" '+(checked?'checked':'')+'>'
                    + '<span>'+r.avatar+' '+r.name+'</span></label>';
            });
            html += '<div style="margin-top:12px;display:flex;gap:8px;"><button id="saveMembersBtn" class="btn-primary-mod" style="flex:1;">保存</button></div>';
            var list = document.getElementById('roleList');
            list.innerHTML = html;
            document.getElementById('saveMembersBtn').onclick = function(){
                var checks = list.querySelectorAll('input[type=checkbox]');
                var newMembers = [];
                checks.forEach(function(c){ if (c.checked) newMembers.push(c.dataset.roleid); });
                group.memberIds = newMembers;
                saveAppearance();
                renderRoleSwitcher();
                showToast('已更新群成员');
            };
        }

        // ===== 初始化 =====
        function init() {
            loadProfile();
            loadAppearance();

            renderCards();
            renderEmojis();
            renderPats();
            renderStatuses();

            addChatMessage(`✦ 递出你的话语…… 字卡已备好。`, 'system');
            userInput.focus();

            // 右侧侧边栏
            openSidePanelBtn.addEventListener('click', openSidePanel);
            sideCloseBtn.addEventListener('click', closeSidePanel);
            sideOverlay.addEventListener('click', closeSidePanel);

            // 底部上弹侧边栏
            arrowUpBtn.addEventListener('click', toggleBottomSheet);

            // 底部按钮
            bottomCallBtn.addEventListener('click', () => {
                closeBottomSheet();
                if (chatSoundCall) playSfx('call');
                openModal(callModal);
            });
            bottomEmojiBtn.addEventListener('click', () => {
                closeBottomSheet();
                closePatQuickPanel();
                openEmojiQuickPanel();
            });
            bottomPatBtn.addEventListener('click', () => {
                closeBottomSheet();
                closeEmojiQuickPanel();
                const panel = document.getElementById('patQuickPanel');
                if (panel) panel.classList.toggle('open');
                renderQuickPatChips();
            });

            // 侧边栏按钮
            sideCardBtn.addEventListener('click', () => { closeSidePanel(); renderStatuses(); openModal(cardModal); });
            sideEmojiBtn.addEventListener('click', () => { closeSidePanel(); openModal(emojiModal); });
            sidePatBtn.addEventListener('click', () => { closeSidePanel(); renderPats(); openModal(patModal); });

            // 设置主弹窗
            openSettingsBtn.addEventListener('click', () => { showSettingsView(null); openModal(settingsModal); });
            closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
            settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(settingsModal); });

            // 设置三大板块导航
            openAppearanceBtn.addEventListener('click', () => showSettingsView(appearanceView));
            openChatSettingsBtn.addEventListener('click', () => showSettingsView(chatSettingsView));
            openDataMgmtBtn.addEventListener('click', () => showSettingsView(dataMgmtView));
            backFromAppearance.addEventListener('click', () => showSettingsView(null));
            backFromChat.addEventListener('click', () => showSettingsView(null));
            backFromData.addEventListener('click', () => showSettingsView(null));

            // 外观设置五个子板块（以弹窗形式显示）
            openThemeBtn.addEventListener('click', () => openSubModal(themeModal));
            openBgFontBtn.addEventListener('click', () => openSubModal(bgFontModal));
            openBubbleBtn.addEventListener('click', () => openSubModal(bubbleModal));
            openAvatarBtn.addEventListener('click', () => openSubModal(avatarModal));
            openNicknameBtn.addEventListener('click', () => openSubModal(nicknameModal));

            // 子板块关闭
            closeThemeModal.addEventListener('click', () => closeModal(themeModal));
            themeModal.addEventListener('click', (e) => { if (e.target === themeModal) closeModal(themeModal); });

            // ==== 主题外观 事件绑定 ====
            // 快捷换肤
            document.querySelectorAll('#themeQuickSwatches .quick-swatch').forEach(el => {
                el.addEventListener('click', () => {
                    const q = el.dataset.quick;
                    if (q === 'custom') {
                        // 自定义：只更新选中态，用下面的颜色输入编辑
                        document.querySelectorAll('#themeQuickSwatches .quick-swatch').forEach(x => x.classList.remove('active'));
                        el.classList.add('active');
                        currentTheme = 'custom';
                        showToast('进入自定义配色');
                        return;
                    }
                    applyQuickTheme(q);
                });
            });

            // 自定义编辑器 - 颜色输入实时应用
            const propMap = {
                'themeAccentInput':'--accent','themeAccent2Input':'--accent-2','themeBubbleUserInput':'--bubble-user',
                'themeBubbleAngleInput':'--bubble-angle','themeBgChatInput':'--bg-chat','themeBgPageInput':'--bg-page',
                'themeTextPrimaryInput':'--text-primary','themeTextSecondaryInput':'--text-secondary',
                'themeModalBgInput':'--modal-bg',
            };
            Object.keys(propMap).forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.addEventListener('input', () => {
                    document.documentElement.style.setProperty(propMap[id], el.value);
                    if (id === 'themeAccentInput') {
                        document.documentElement.style.setProperty('--accent-deep', shade(el.value, -15));
                        const a2 = document.getElementById('themeAccent2Input');
                        const grad = a2 ? 'linear-gradient(135deg, ' + a2.value + ', ' + el.value + ')' : 'linear-gradient(135deg, #dcc3ed, ' + el.value + ')';
                        document.documentElement.style.setProperty('--avatar-bg-gradient', grad);
                        const av = document.getElementById('angleAvatarDisplay');
                        if (av && !isImageUrl(angleAvatar)) av.style.background = grad;
                    }
                    saveCurrentThemeToStorage();
                });
            });

            // 遮罩颜色 + 透明度 合成
            const applyOverlay = () => {
                const colorEl = document.getElementById('themeOverlayColorInput');
                const opacityEl = document.getElementById('themeOverlayOpacitySlider');
                if (!colorEl) return;
                const color = colorEl.value || '#000000';
                const opacity = opacityEl ? (parseInt(opacityEl.value) / 100) : 0.30;
                document.documentElement.style.setProperty('--modal-overlay', hexToRgba(color, opacity));
                saveCurrentThemeToStorage();
            };
            const overlayColorEl = document.getElementById('themeOverlayColorInput');
            if (overlayColorEl) overlayColorEl.addEventListener('input', applyOverlay);

            // 透明度滑块
            const opacityHandlers = [
                // modal 相关
                ['themeModalOpacitySlider', v => { document.documentElement.style.setProperty('--modal-bg-opacity', v/100); }],
                ['themeOverlayOpacitySlider', applyOverlay],
                ['themeModalBlurSlider', v => { document.documentElement.style.setProperty('--modal-blur', v + 'px'); }],
                // 各区域
                ['themePageOpacitySlider', v => { document.documentElement.style.setProperty('--opacity-page', v/100); }],
                ['themeChatOpacitySlider', v => { document.documentElement.style.setProperty('--opacity-chat-bg', v/100); }],
                ['themeInputOpacitySlider', v => { document.documentElement.style.setProperty('--opacity-input', v/100); }],
                ['themeBubbleUserOpacitySlider', v => { document.documentElement.style.setProperty('--opacity-bubble-user', v/100); }],
                ['themeBubbleAngleOpacitySlider', v => { document.documentElement.style.setProperty('--opacity-bubble-angle', v/100); }],
            ];
            opacityHandlers.forEach(([id, fn]) => {
                const el = document.getElementById(id);
                if (!el) return;
                const vid = id.replace('Slider', 'Val');
                const vEl = document.getElementById(vid);
                const update = () => {
                    fn(parseInt(el.value));
                    if (vEl) {
                        if (id === 'themeModalBlurSlider') vEl.textContent = el.value + 'px';
                        else vEl.textContent = el.value + '%';
                    }
                    saveCurrentThemeToStorage();
                };
                el.addEventListener('input', update);
                el.addEventListener('change', update);
            });

            // 保存主题方案
            const themeSavePresetBtn = document.getElementById('themeSavePresetBtn');
            if (themeSavePresetBtn) themeSavePresetBtn.addEventListener('click', saveThemePreset);

            // ==== 初始化主题 ====
            loadThemeFromStorage();
            loadSavedPresets();
            renderThemePresets();
            closeBgFontModal.addEventListener('click', () => closeModal(bgFontModal));
            bgFontModal.addEventListener('click', (e) => { if (e.target === bgFontModal) closeModal(bgFontModal); });
            closeBubbleModal.addEventListener('click', () => closeModal(bubbleModal));
            bubbleModal.addEventListener('click', (e) => { if (e.target === bubbleModal) closeModal(bubbleModal); });

            // 昵称弹窗
            closeNicknameModal.addEventListener('click', () => closeModal(nicknameModal));
            nicknameModal.addEventListener('click', (e) => { if (e.target === nicknameModal) closeModal(nicknameModal); });
            saveNicknameBtn.addEventListener('click', () => {
                userName = userNameInput.value.trim() || '我';
                angleName = angleNameInput.value.trim() || 'ta';
                // 保存称呼概率滑条的最终值（防止 change 事件未触发场景）
                const acs = document.getElementById('angleCallChanceSlider');
                if (acs) angleCallChance = parseInt(acs.value) || 0;
                saveFullProfile();
                saveAppearance(); // 称呼chips + 概率滑条等存在dream_appearance中
                closeModal(nicknameModal);
            });

            // 头像弹窗
            closeAvatarModal.addEventListener('click', () => closeModal(avatarModal));
            avatarModal.addEventListener('click', (e) => { if (e.target === avatarModal) closeModal(avatarModal); });
            shapeBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    avatarShape = this.dataset.shape;
                    shapeBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    applyProfile();
                });
            });
            applyUserAvatarBtn.addEventListener('click', () => {
                userAvatar = userAvatarInput.value.trim() || '🌸';
                applyProfile();
            });
            applyAngleAvatarBtn.addEventListener('click', () => {
                angleAvatar = angleAvatarInput.value.trim() || '🌙';
                applyProfile();
            });
            removeUserAvatarBtn.addEventListener('click', () => {
                userAvatar = '🌸'; userAvatarInput.value = '🌸'; applyProfile();
            });
            removeAngleAvatarBtn.addEventListener('click', () => {
                angleAvatar = '🌙'; angleAvatarInput.value = '🌙'; applyProfile();
            });
            // 点击上传按钮 → 在用户手势中触发隐藏 file input 的文件选择对话框
            userAvatarUploadBtn.addEventListener('click', () => { userAvatarFile.click(); });
            angleAvatarUploadBtn.addEventListener('click', () => { angleAvatarFile.click(); });
            // 文件上传：梦女头像（JPG/PNG/GIF/WEBP 等）
            userAvatarFile.addEventListener('change', function() {
                const file = this.files && this.files[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) { showToast('请选择图片文件'); this.value = ''; return; }
                if (file.size > 4 * 1024 * 1024) { showToast('图片过大（>4MB），可能无法保存，建议压缩'); }
                const reader = new FileReader();
                reader.onload = function(e) {
                    userAvatar = e.target.result;
                    userAvatarInput.value = userAvatar;
                    applyProfile();
                    showToast('梦女头像上传成功');
                };
                reader.onerror = function() { showToast('读取失败，请重试'); };
                reader.readAsDataURL(file);
                this.value = '';
            });
            // 文件上传：梦角头像
            angleAvatarFile.addEventListener('change', function() {
                const file = this.files && this.files[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) { showToast('请选择图片文件'); this.value = ''; return; }
                if (file.size > 4 * 1024 * 1024) { showToast('图片过大（>4MB），可能无法保存，建议压缩'); }
                const reader = new FileReader();
                reader.onload = function(e) {
                    angleAvatar = e.target.result;
                    angleAvatarInput.value = angleAvatar;
                    applyProfile();
                    showToast('梦角头像上传成功');
                };
                reader.onerror = function() { showToast('读取失败，请重试'); };
                reader.readAsDataURL(file);
                this.value = '';
            });
            // 头像设置：恢复默认
            restoreDefaultAvatarBtn.addEventListener('click', () => {
                if (!confirm('恢复头像设置为默认？将重置头像、形状与位置参数。')) return;
                userAvatar = '🌸'; angleAvatar = '🌙';
                avatarShape = 'circle';
                userSize = 60; userLeft = 0; userTop = 0;
                angleSize = 60; angleLeft = 0; angleTop = 0;
                userAvatarInput.value = userAvatar;
                angleAvatarInput.value = angleAvatar;
                shapeBtns.forEach(b => b.classList.toggle('active', b.dataset.shape === avatarShape));
                applyProfile();
                showToast('已恢复默认头像设置');
            });
            [userSizeSlider, userLeftSlider, userTopSlider, angleSizeSlider, angleLeftSlider, angleTopSlider].forEach(
                slider => {
                    slider.addEventListener('input', function() {
                        const id = this.id;
                        const val = parseInt(this.value);
                        const labelMap = {
                            userSizeSlider: 'userSizeValue', userLeftSlider: 'userLeftValue', userTopSlider: 'userTopValue',
                            angleSizeSlider: 'angleSizeValue', angleLeftSlider: 'angleLeftValue', angleTopSlider: 'angleTopValue'
                        };
                        const valueEl = document.getElementById(labelMap[id]);
                        if (valueEl) valueEl.textContent = val + 'px';
                        if (id === 'userSizeSlider') userSize = val;
                        else if (id === 'userLeftSlider') userLeft = val;
                        else if (id === 'userTopSlider') userTop = val;
                        else if (id === 'angleSizeSlider') angleSize = val;
                        else if (id === 'angleLeftSlider') angleLeft = val;
                        else if (id === 'angleTopSlider') angleTop = val;
                        applyProfile();
                    });
                });
            saveAvatarBtn.addEventListener('click', () => { saveFullProfile(); closeModal(avatarModal); });

            // 气泡
            bubbleShapeSelect.addEventListener('change', function() { bubbleShape = this.value; applyBubbleStyle(); });
            applyBubbleUserColor.addEventListener('click', () => {
                bubbleUserColor = bubbleUserColorInput.value;
                // 同步到主题变量
                document.documentElement.style.setProperty('--bubble-user', bubbleUserColor);
                const tEl = document.getElementById('themeBubbleUserInput');
                if (tEl) tEl.value = bubbleUserColor;
                applyBubbleStyle();
                saveCurrentThemeToStorage();
            });
            applyBubbleAngleColor.addEventListener('click', () => {
                bubbleAngleColor = bubbleAngleColorInput.value;
                document.documentElement.style.setProperty('--bubble-angle', bubbleAngleColor);
                const tEl = document.getElementById('themeBubbleAngleInput');
                if (tEl) tEl.value = bubbleAngleColor;
                applyBubbleStyle();
                saveCurrentThemeToStorage();
            });
            // 反向同步：主题外观气泡颜色变化时同步到这里
            const themeBubbleUserInput = document.getElementById('themeBubbleUserInput');
            if (themeBubbleUserInput) themeBubbleUserInput.addEventListener('input', () => {
                bubbleUserColor = themeBubbleUserInput.value;
                bubbleUserColorInput.value = bubbleUserColor;
                applyBubbleStyle();
            });
            const themeBubbleAngleInput = document.getElementById('themeBubbleAngleInput');
            if (themeBubbleAngleInput) themeBubbleAngleInput.addEventListener('input', () => {
                bubbleAngleColor = themeBubbleAngleInput.value;
                bubbleAngleColorInput.value = bubbleAngleColor;
                applyBubbleStyle();
            });
            bubbleRadiusSlider.addEventListener('input', function() {
                bubbleRadius = parseInt(this.value);
                bubbleRadiusValue.textContent = bubbleRadius + 'px';
                applyBubbleStyle();
            });
            saveBubbleBtn.addEventListener('click', () => { saveAppearance(); closeModal(bubbleModal); showToast('气泡设置已保存'); });

            // 背景&字体
            applyBgColorBtn.addEventListener('click', () => { bgColor = bgColorInput.value; applyBubbleStyle(); });
            applyBgImageBtn.addEventListener('click', () => { bgImage = bgImageInput.value.trim(); applyBubbleStyle(); });
            clearBgImageBtn.addEventListener('click', () => { bgImage = ''; bgImageInput.value = ''; applyBubbleStyle(); });
            fontSizeSlider.addEventListener('input', function() {
                fontSize = parseInt(this.value);
                fontSizeValue.textContent = fontSize + 'px';
                applyBubbleStyle();
            });
            fontFamilySelect.addEventListener('change', function() { fontFamily = this.value; applyBubbleStyle(); });
            saveBgFontBtn.addEventListener('click', () => { saveAppearance(); closeModal(bgFontModal); showToast('背景&字体已保存'); });

                
// 数据管理
            dataExportBtn.addEventListener('click', exportData);
            dataImportFileBtn.addEventListener('click', importDataFromFile);
            dataImportFile.addEventListener('change', handleImportFile);
            dataClearBtn.addEventListener('click', clearAllData);
            const chatImportBtn = document.getElementById('chatImportBtn');
            if (chatImportBtn) chatImportBtn.addEventListener('click', importChatHistory);
            const chatImportFile = document.getElementById('chatImportFile');
            if (chatImportFile) chatImportFile.addEventListener('change', handleChatImportFile);
            const chatClearBtn = document.getElementById('chatClearBtn');
            if (chatClearBtn) chatClearBtn.addEventListener('click', clearCurrentChat);

            // 字卡
            closeCardModal.addEventListener('click', () => closeModal(cardModal));
            cardModal.addEventListener('click', (e) => { if (e.target === cardModal) closeModal(cardModal); });
            // 梦角状态
            statusAddBtn.addEventListener('click', addStatus);
            statusInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addStatus(); });
            // 字卡类型切换
            cardTypeShared.addEventListener('click', function(){ switchCardView('shared'); });
            cardTypePersonal.addEventListener('click', function(){ switchCardView('personal'); });
            personalCardAddBtn.addEventListener('click', addPersonalCard);
            personalCardInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addPersonalCard(); });
            modAddGroupBtn.addEventListener('click', addCardGroup);
            modGroupInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCardGroup(); });
            modDeleteGroupBtn.addEventListener('click', deleteCardGroup);
            modBatchImportBtn.addEventListener('click', batchImportCards);
            const modJsonImportBtn = document.getElementById('modJsonImportBtn');
            if (modJsonImportBtn) modJsonImportBtn.addEventListener('click', jsonImportCards);
            if (modBatchInput) modBatchInput.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') batchImportCards(); });
            modClearBatchBtn.addEventListener('click', () => { modBatchInput.value = ''; });
            modBatchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); batchImportCards(); }
            });
            modSelectBtn.addEventListener('click', toggleCardSelectMode);
            modDeleteSelectedBtn.addEventListener('click', deleteCardSelected);
            modMoveBtn.addEventListener('click', moveCardSelected);
            modClearAllBtn.addEventListener('click', clearAllCards);
            modResetDefaultBtn.addEventListener('click', resetDefaultCards);
            modSearchInput.addEventListener('input', function() { cardSearch = this.value; renderCards(); });

            // 表情包
            closeEmojiModal.addEventListener('click', () => closeModal(emojiModal));
            emojiModal.addEventListener('click', (e) => { if (e.target === emojiModal) closeModal(emojiModal); });
            emojiSearchInput.addEventListener('input', function() { emojiSearch = this.value; renderEmojis(); });
            addEmojiBtn.addEventListener('click', addEmoji);
            emojiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addEmoji(); });
            clearEmojiBtn.addEventListener('click', clearEmojis);
            resetEmojiBtn.addEventListener('click', resetEmojis);
            emojiSelectBtn.addEventListener('click', toggleEmojiSelectMode);
            emojiDeleteSelectedBtn.addEventListener('click', deleteEmojiSelected);
            emojiMoveBtn.addEventListener('click', moveEmojiSelected);
            emojiBatchImportBtn.addEventListener('click', batchImportEmojis);
            emojiClearBatchBtn.addEventListener('click', () => { emojiBatchInput.value = ''; });
            emojiBatchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); batchImportEmojis(); }
            });
            emojiAddGroupBtn.addEventListener('click', addEmojiGroup);
            emojiGroupInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addEmojiGroup(); });
            emojiDeleteGroupBtn.addEventListener('click', deleteEmojiGroup);

            // 拍一拍
            closePatModal.addEventListener('click', () => closeModal(patModal));
            patModal.addEventListener('click', (e) => { if (e.target === patModal) closeModal(patModal); });
            patSearchInput.addEventListener('input', function() { patSearch = this.value; renderPats(); });
            addPatBtn.addEventListener('click', addPat);
            patInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addPat(); });
            clearPatBtn.addEventListener('click', clearPats);
            resetPatBtn.addEventListener('click', resetPats);
            patSelectBtn.addEventListener('click', togglePatSelectMode);
            patDeleteSelectedBtn.addEventListener('click', deletePatSelected);
            patMoveBtn.addEventListener('click', movePatSelected);
            patBatchImportBtn.addEventListener('click', batchImportPats);
            const patJsonImportBtn = document.getElementById('patJsonImportBtn');
            if (patJsonImportBtn) patJsonImportBtn.addEventListener('click', jsonImportPats);
            patClearBatchBtn.addEventListener('click', () => { patBatchInput.value = ''; });
            patBatchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); batchImportPats(); }
            });
            patAddGroupBtn.addEventListener('click', addPatGroup);
            patGroupInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addPatGroup(); });
            patDeleteGroupBtn.addEventListener('click', deletePatGroup);

            // 通话
            closeCallModal.addEventListener('click', () => closeModal(callModal));
            callModal.addEventListener('click', (e) => { if (e.target === callModal) closeModal(callModal); });
            callBtn.addEventListener('click', startCall);
            hangupBtn.addEventListener('click', hangupCall);

            // 发送 - Enter发送由 chatEnterSend 控制，Shift+Enter 始终换行
            sendBtn.addEventListener('click', handleSend);
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && chatEnterSend) { e.preventDefault(); handleSend(); }
            });

            // 模拟视频通话开关 → 隐藏通话按钮
            const chatCallEnabled = document.getElementById('chatCallEnabled');
            if (chatCallEnabled) {
                chatCallEnabled.addEventListener('change', () => {
                    const show = chatCallEnabled.checked;
                    if (bottomCallBtn) bottomCallBtn.style.display = show ? '' : 'none';
                    if (sideCardBtn && sideCardBtn.id) {} // side grid stays
                    // Also hide in side panel
                    const sideCall = document.querySelector('#sidePanel .side-grid-item'); // there's no specific call btn in side
                });
                // Initial state
                chatCallEnabled.dispatchEvent(new Event('change'));
            }

            // 单击头像打开设置，双击头像拍一拍
            let profileClickTimer = null;
            document.getElementById('profileClick').addEventListener('click', () => {
                if (profileClickTimer) return;
                profileClickTimer = setTimeout(function(){
                    profileClickTimer = null;
                    showSettingsView(null);
                    openModal(settingsModal);
                }, 220);
            });
            document.getElementById('profileClick').addEventListener('dblclick', (ev) => {
                ev.preventDefault();
                if (profileClickTimer) { clearTimeout(profileClickTimer); profileClickTimer = null; }
                triggerPat('angle');
            });
            chatBox.addEventListener('click', (e) => {
                if (e.target.closest('.message') || e.target.closest('.msg-toolbar') || e.target.closest('.msg-recall-notice')) return;
                userInput.focus();
            });
            // 双击头像触发拍一拍
            chatBox.addEventListener('dblclick', (e) => {
                const avatar = e.target.closest('.msg-avatar');
                if (!avatar) return;
                const msg = avatar.closest('.message');
                if (!msg) return;
                // 双击梦角头像（angle/system）→ 梦女拍梦角；双击自己头像 → 拍自己
                const type = msg.classList.contains('user') ? 'user' : 'angle';
                triggerPat(type);
            });

            // ========== 昵称折叠 ==========
            const callUserToggle = document.getElementById('callUserToggle');
            const callAngleToggle = document.getElementById('callAngleToggle');
            const callAngleBody = document.getElementById('callAngleBody');
            const callAngleArrow = document.getElementById('callAngleArrow');
            const callUserBody = document.getElementById('callUserBody');
            const callUserArrow = callUserToggle ? callUserToggle.querySelector('.call-arrow') : null;
            function toggleCallBody(body, arrow) {
                const show = body.style.display === 'none' || !body.style.display;
                body.style.display = show ? 'block' : 'none';
                if (arrow) arrow.style.transform = show ? 'rotate(90deg)' : 'rotate(0deg)';
                if (show) body.classList.add('open');
                else body.classList.remove('open');
            }
            if (callUserToggle) callUserToggle.addEventListener('click', () => toggleCallBody(callUserBody, callUserArrow));
            if (callAngleToggle) callAngleToggle.addEventListener('click', () => toggleCallBody(callAngleBody, callAngleArrow));
            // 回复称呼概率滑条
            const angleCallChanceSlider = document.getElementById('angleCallChanceSlider');
            const angleCallChanceVal = document.getElementById('angleCallChanceVal');
            function syncCallChance() {
                if (angleCallChanceSlider) angleCallChanceSlider.value = angleCallChance;
                if (angleCallChanceVal) angleCallChanceVal.textContent = angleCallChance + '%';
            }
            syncCallChance();
            if (angleCallChanceSlider) angleCallChanceSlider.addEventListener('input', () => {
                angleCallChance = parseInt(angleCallChanceSlider.value);
                if (angleCallChanceVal) angleCallChanceVal.textContent = angleCallChance + '%';
            });
            if (angleCallChanceSlider) angleCallChanceSlider.addEventListener('change', saveAppearance);

            // ========== 引用回复栏 ==========
            const quoteBar = document.getElementById('quoteBar');
            const quoteBarFrom = document.getElementById('quoteBarFrom');
            const quoteBarText = document.getElementById('quoteBarText');
            const quoteBarClear = document.getElementById('quoteBarClear');
            if (quoteBarClear) quoteBarClear.addEventListener('click', clearQuoteBar);

            // ========== 消息拓展工具栏 ==========
            const toolbar = document.getElementById('msgToolbar');
            let curToolbarMsgId = null;
            let curToolbarSender = null;
            let curToolbarDiv = null;
            function openMsgToolbar(div, ev) {
                closeMarkPickers();
                const mid = div.dataset.msgId;
                const sender = div.dataset.sender;
                curToolbarMsgId = mid; curToolbarSender = sender; curToolbarDiv = div;
                const rect = div.getBoundingClientRect();
                toolbar.style.display = 'inline-flex'; // 先显示，下一帧再算 rect + 加 show class 得入场动画
                requestAnimationFrame(() => {
                    const tbRect = toolbar.getBoundingClientRect();
                    // 长按触发者位置：放在消息正上方中间对齐；如果上方不够，就放下方
                    let left = rect.left + (rect.width - tbRect.width) / 2;
                    let top = rect.top - tbRect.height - 10;
                    if (top < 8) top = rect.bottom + 10;
                    if (left < 8) left = 8;
                    if (left + tbRect.width > window.innerWidth - 8) left = window.innerWidth - tbRect.width - 8;
                    toolbar.style.left = left + 'px';
                    toolbar.style.top = top + 'px';
                    toolbar.classList.add('show');
                });
                if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
            }
            function closeMsgToolbar() {
                if (toolbar) { toolbar.classList.remove('show'); setTimeout(() => { if(toolbar && !toolbar.classList.contains('show')) toolbar.style.display = ''; }, 180); }
                curToolbarMsgId = null; curToolbarSender = null; curToolbarDiv = null;
            }
            // ========== 长按触发（450ms）+ 桌面端右键回退 ==========
            let __lpTimer = null;
            let __lpMsgDiv = null;
            let __lpFired = false;
            function __lpClear() {
                if (__lpTimer) { clearTimeout(__lpTimer); __lpTimer = null; }
                if (__lpMsgDiv && __lpFired) { __lpMsgDiv.classList.remove('lp-highlight'); }
                __lpMsgDiv = null; __lpFired = false;
            }
            function __lpStart(ev, msgDiv) {
                // 受聊天设置开关 chatQuoteEnabled 控制：关闭时长按不弹窗
                if (!chatQuoteEnabled) return;
                __lpClear();
                __lpMsgDiv = msgDiv;
                __lpFired = false;
                msgDiv.classList.add('lp-highlight');
                __lpTimer = setTimeout(() => {
                    __lpFired = true;
                    try {
                        if (window.navigator && navigator.vibrate) { try { navigator.vibrate(18); } catch(e){} } // 移动端触觉反馈
                    } catch(e){}
                    openMsgToolbar(msgDiv, ev);
                }, 450);
            }
            // pointerdown / touchstart 开始计时
            chatBox.addEventListener('pointerdown', (e) => {
                const msgDiv = e.target.closest('.message');
                if (!msgDiv) return;
                if (e.target.closest('.msg-toolbar') || e.target.closest('.msg-recall-notice')) return;
                // 只响应主键（鼠标左键 / 默认 pointerType）
                if (e.button != null && e.button !== 0) return;
                __lpStart(e, msgDiv);
            }, { passive: true });
            chatBox.addEventListener('touchstart', (e) => {
                const msgDiv = e.target.closest('.message');
                if (!msgDiv) return;
                if (e.target.closest('.msg-toolbar') || e.target.closest('.msg-recall-notice')) return;
                __lpStart(e, msgDiv);
            }, { passive: true });
            // 取消场景：up / cancel / leave / scroll / 按键抬起
            ['pointerup','pointercancel','pointerleave','touchend','touchcancel','touchmove'].forEach(evt => {
                chatBox.addEventListener(evt, __lpClear, { passive: true });
            });
            // 桌面端右键 → 直接弹出（长按的兼容备用，同样受 chatQuoteEnabled 控制）
            chatBox.addEventListener('contextmenu', (e) => {
                if (!chatQuoteEnabled) return;
                const msgDiv = e.target.closest('.message');
                if (msgDiv && !e.target.closest('.msg-recall-notice') && !e.target.closest('.msg-toolbar')) {
                    e.preventDefault(); e.stopPropagation();
                    __lpClear();
                    openMsgToolbar(msgDiv, e);
                }
            });
            // 点击空白处关闭工具栏
            chatBox.addEventListener('click', (e) => {
                if (!e.target.closest('.message') && !e.target.closest('.msg-toolbar')) closeMsgToolbar();
            });
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.msg-toolbar') && !e.target.closest('.message')) closeMsgToolbar();
                if (!e.target.closest('#markColorPicker') && !e.target.closest('#markNoteInput') && !e.target.closest('[data-action="mark"]')) {
                    closeMarkPickers();
                }
            });
            // 工具栏按钮事件
            if (toolbar) toolbar.addEventListener('click', (e) => {
                e.stopPropagation();
                const btn = e.target.closest('button');
                if (!btn) return;
                const action = btn.dataset.action;
                if (!action) return;
                const div = curToolbarDiv;
                const sender = curToolbarSender;
                const mid = curToolbarMsgId;
                if (!div) return;
                const contentEl = div.querySelector('.msg-content');
                const text = contentEl ? contentEl.textContent.trim() : '';
                switch (action) {
                    case 'quote': {
                        if (!chatQuoteEnabled) { showToast('引用回复功能未开启'); break; }
                        if (quoteMsg) { quoteMsg = null; clearQuoteBar(); }
                        else { quoteMsg = { sender, text }; showQuoteBar(sender, text); }
                        closeMsgToolbar();
                        break;
                    }
                    case 'fav': {
                        const pool = favorites['usr'] || (favorites['usr'] = []);
                        // 查是否已经收藏过该条消息（按 msgId 或 按文本+发送者）
                        const existIdx = pool.findIndex(i => (mid && i.msgId === mid) || (!mid && i.text === text && i.sender === sender));
                        if (existIdx >= 0) {
                            // 再次点击 = 取消收藏
                            pool.splice(existIdx, 1);
                            // 移除 DOM 星标
                            const starEl = div.querySelector('.msg-fav-star');
                            if (starEl) starEl.remove();
                            saveAppearance();
                            showToast('已取消收藏');
                        } else {
                            const item = {
                                id: 'fav-' + Date.now().toString(36),
                                msgId: mid || '',
                                text, sender,
                                ts: Date.now(),
                                from: (sender==='usr' ? userName : angleName)
                            };
                            pool.unshift(item);
                            // 给消息加星标
                            if (!div.querySelector('.msg-fav-star')) {
                                const star = document.createElement('span');
                                star.className = 'msg-fav-star'; star.textContent = '⭐';
                                div.appendChild(star);
                            }
                            saveAppearance();
                            showToast('已收藏到「我的收藏」');
                        }
                        closeMsgToolbar();
                        break;
                    }
                    case 'mark': {
                        // 标注分桶：梦女手动标注 → marks.usr「我的标注」；梦角自动/发起标注 → marks.angle「ta 的标注」
                        const contentDiv = div.querySelector('.msg-content');
                        const pool = marks['usr'] || (marks['usr'] = []);
                        // 查找同一条消息：优先 msgId 精确匹配，其次 文本+发送者匹配
                        const existIdx = pool.findIndex(i =>
                            (mid && i.msgId === mid) ||
                            (!mid && i.text === text && i.sender === sender)
                        );
                        const hasMark = contentDiv && contentDiv.style.background && /rgba?|^#|color/.test(contentDiv.style.background);
                        if (existIdx >= 0 || hasMark) {
                            // 再次点击 = 取消标注
                            let removedColor = '';
                            if (existIdx >= 0) {
                                const removed = pool.splice(existIdx, 1)[0];
                                removedColor = removed.color || '';
                            }
                            // 同步清除所有 tab 中相同 msgId 的残留
                            for (const k of Object.keys(marks)) {
                                marks[k] = (marks[k] || []).filter(i => !((mid && i.msgId === mid) || (!mid && i.text === text && i.sender === sender)));
                            }
                            if (contentDiv) {
                                contentDiv.style.background = '';
                                contentDiv.style.padding = '';
                                contentDiv.style.borderRadius = '';
                            }
                            saveAppearance();
                            showToast('已取消标注');
                            closeMsgToolbar();
                        } else {
                            // 打开颜色选择器，msgId 带给 savePendingMark
                            openMarkPicker(div, sender, text, mid, 'usr');
                        }
                        break;
                    }
                    case 'delete': {
                        if (!confirm('确定删除此消息吗？（不可恢复）')) break;
                        div.remove();
                        closeMsgToolbar();
                        saveAppearance();
                        break;
                    }
                    case 'recall': {
                        doRecall(div, sender, text);
                        break;
                    }
                }
            });

            // ========== 撤回功能 ==========
            function doRecall(div, sender, text) {
                const rect = div.getBoundingClientRect();
                const recalledBy = sender === 'usr' ? userName : angleName;
                const otherSide = sender === 'usr' ? angleName : userName;
                const noticeId = 'rn-' + Date.now().toString(36);
                let noticeText;
                let cacheRecall = false;
                // 撤回自己的消息 → 普通提示
                // 撤回对方的消息 → 带链接可查看内容
                if (sender === 'usr') {
                    // 我撤回我自己的消息
                    noticeText = `${userName} 撤回了一条消息`;
                } else {
                    // 我撤回对方的消息（或对方撤回我）：这里的"撤回对方"是用户在操作
                    noticeText = `${userName} 撤回了 ${angleName} 的一条消息`;
                    cacheRecall = true;
                }
                const notice = document.createElement('div');
                notice.className = 'message';
                notice.style.margin = 0;
                notice.style.padding = 0;
                notice.style.background = 'transparent';
                notice.style.boxShadow = 'none';
                notice.style.border = 'none';
                notice.innerHTML = `<div class="msg-recall-notice" id="${noticeId}">${noticeText}${cacheRecall ? ' <span class="link">查看内容</span>' : ''}</div>`;
                div.parentNode.insertBefore(notice, div.nextSibling);
                if (cacheRecall) {
                    recalledCache[noticeId] = {
                        text, sender, originalName: sender==='usr'?userName:angleName,
                        recalledBy: userName, ts: Date.now()
                    };
                    saveAppearance();
                    const link = notice.querySelector('.link');
                    if (link) link.addEventListener('click', () => {
                        const c = recalledCache[noticeId];
                        if (!c) return;
                        showToast(`内容：${c.text}`);
                    });
                }
                // 梦角也会撤回我的消息（10%概率"反撤回"，这里由用户操作触发撤回，不做反撤回逻辑）
                // 梦角自主撤回我发送的消息（3%概率被动触发），在 replyWithRandomCard 之后模拟
                div.remove();
                closeMsgToolbar();
                saveAppearance();
            }
            // 梦角自主撤回（小概率）
            function angleRecallUserMsgRandom() {
                // 在 replyWithRandomCard 之后调用，找用户最新消息撤回
                const userMsgs = chatBox.querySelectorAll('.message.user');
                if (!userMsgs.length) return;
                if (Math.random() > 0.02) return;  // 2% 概率
                const last = userMsgs[userMsgs.length - 1];
                const contentEl = last.querySelector('.msg-content');
                const text = contentEl ? contentEl.textContent.trim() : '';
                if (!text) return;
                const noticeId = 'rn-' + Date.now().toString(36);
                const notice = document.createElement('div');
                notice.innerHTML = `<div class="msg-recall-notice" id="${noticeId}">${angleName} 撤回了 ${userName} 的一条消息 <span class="link">查看内容</span></div>`;
                const wrap = notice.firstChild;
                last.parentNode.insertBefore(wrap, last.nextSibling);
                recalledCache[noticeId] = {
                    text, sender: 'usr', originalName: userName,
                    recalledBy: angleName, ts: Date.now()
                };
                saveAppearance();
                const link = wrap.querySelector('.link');
                if (link) link.addEventListener('click', () => {
                    const c = recalledCache[noticeId];
                    if (c) showToast(`内容：${c.text}`);
                });
                last.remove();
            }

            // 梦角偶尔收藏梦女的最新消息 → 存入「ta 的收藏」(favorites.angle)
            function angleFavUserMsgRandom() {
                const userMsgs = chatBox.querySelectorAll('.message.user');
                if (!userMsgs.length) return;
                if (Math.random() > 0.04) return;  // 4% 概率
                const last = userMsgs[userMsgs.length - 1];
                const contentEl = last.querySelector('.msg-content');
                const text = contentEl ? contentEl.textContent.trim() : '';
                if (!text) return;
                if (!favorites.angle) favorites.angle = [];
                if (favorites.angle.some(i => i.text === text)) return;  // ta 已收藏过
                const msgId = last.dataset.msgId || '';
                const item = { id: 'fav-' + Date.now().toString(36), msgId, text, sender: 'usr', ts: Date.now(), from: userName };
                favorites.angle.unshift(item);
                // 若尚无星标则补一个
                if (!last.querySelector('.msg-fav-star')) {
                    const star = document.createElement('span');
                    star.className = 'msg-fav-star'; star.textContent = '⭐';
                    last.appendChild(star);
                }
                saveAppearance();
                showToast(`${angleName} 收藏了你的一条消息`);
            }

            // ========== 标注：颜色选择 + 备注输入 ==========
            const markColorPicker = document.getElementById('markColorPicker');
            const markNoteInput = document.getElementById('markNoteInput');
            const markNoteConfirm = document.getElementById('markNoteConfirm');
            const markNoteCancel = document.getElementById('markNoteCancel');
            const markNoteText = document.getElementById('markNoteText');
            const markColors = [
                { name: '无', v: '' },
                { name: '黄色', v: 'rgba(255, 238, 173, 0.55)' },
                { name: '绿色', v: 'rgba(190, 242, 210, 0.55)' },
                { name: '蓝色', v: 'rgba(190, 227, 248, 0.55)' },
                { name: '粉色', v: 'rgba(255, 214, 235, 0.55)' },
                { name: '紫色', v: 'rgba(227, 212, 245, 0.55)' },
                { name: '橙色', v: 'rgba(255, 220, 180, 0.55)' }
            ];
            if (markColorPicker) {
                markColors.forEach(c => {
                    const d = document.createElement('div');
                    d.className = 'mc';
                    d.style.background = c.v || 'repeating-linear-gradient(45deg, #eee, #eee 4px, #fff 4px, #fff 8px)';
                    d.title = c.name || '取消颜色';
                    d.dataset.color = c.v;
                    markColorPicker.appendChild(d);
                });
            }
            // 梦角偶尔标注梦女的最新消息 → 存入「ta 的标注」(marks.angle)（markColors 已定义）
            function angleMarkUserMsgRandom() {
                const userMsgs = chatBox.querySelectorAll('.message.user');
                if (!userMsgs.length) return;
                if (Math.random() > 0.03) return;  // 3%
                const last = userMsgs[userMsgs.length - 1];
                const contentEl = last.querySelector('.msg-content');
                const text = contentEl ? contentEl.textContent.trim() : '';
                if (!text) return;
                if (!marks.angle) marks.angle = [];
                const msgId = last.dataset.msgId || '';
                if (marks.angle.some(i => (msgId && i.msgId === msgId) || (!msgId && i.text === text && i.sender === 'usr'))) return;
                const colors = markColors.filter(c => c.v).map(c => c.v);
                const color = colors[Math.floor(Math.random() * colors.length)];
                if (contentEl) {
                    contentEl.style.background = color;
                    contentEl.style.padding = '6px 10px';
                    contentEl.style.borderRadius = '14px';
                }
                const now = Date.now();
                marks.angle.unshift({
                    id: 'm-' + now.toString(36) + Math.random().toString(36).slice(2,6),
                    msgId, text, sender: 'usr', ts: now,
                    color, note: '', marker: 'angle',
                    from: userName
                });
                saveAppearance();
                showToast(`${angleName} 标注了你的一条消息`);
            }
            let pendingMark = null;
            // marker: 'usr' = 梦女手动标注（默认） / 'angle' = 梦角发起标注
            function openMarkPicker(div, sender, text, msgId, marker) {
                pendingMark = { div, sender, text, msgId: msgId || '', marker: marker || 'usr' };
                const tbRect = toolbar.getBoundingClientRect();
                markColorPicker.style.left = Math.max(4, Math.min(window.innerWidth - 300, tbRect.left)) + 'px';
                markColorPicker.style.top = (tbRect.bottom + 6) + 'px';
                markColorPicker.classList.add('show');
                markColorPicker._sentinel = 'show';
            }
            function closeMarkPickers() {
                if (markColorPicker) markColorPicker.classList.remove('show');
                if (markNoteInput) markNoteInput.classList.remove('show');
                pendingMark = null;
            }
            if (markColorPicker) markColorPicker.addEventListener('click', (e) => {
                const mc = e.target.closest('.mc');
                if (!mc || !pendingMark) return;
                const color = mc.dataset.color;
                // 先应用颜色，下一步可加备注
                pendingMark.color = color;
                // 直接应用背景色
                const contentDiv = pendingMark.div.querySelector('.msg-content');
                if (contentDiv) {
                    if (color) {
                        contentDiv.style.background = color;
                        contentDiv.style.padding = '6px 10px';
                        contentDiv.style.borderRadius = '14px';
                    } else {
                        contentDiv.style.background = '';
                        contentDiv.style.padding = '';
                        contentDiv.style.borderRadius = '';
                    }
                }
                closeMsgToolbar();
                // 打开备注输入框
                if (markNoteInput && markNoteText) {
                    markNoteInput.style.left = markColorPicker.style.left;
                    markNoteInput.style.top = markColorPicker.style.top;
                    markNoteInput.classList.add('show');
                    markNoteText.value = '';
                    setTimeout(() => markNoteText.focus(), 0);
                } else {
                    savePendingMark('');
                }
            });
            function savePendingMark(note) {
                if (!pendingMark) return;
                const { sender, text, color, msgId, marker } = pendingMark;
                // 按「标注者」分桶：usr = 我的标注；angle = 他的标注
                const markOwner = marker || 'usr';
                const pool = marks[markOwner] || (marks[markOwner] = []);
                // 去重：同 msgId 或 文本+发送者
                const existingIdx = pool.findIndex(i =>
                    (msgId && i.msgId === msgId) ||
                    (!msgId && i.text === text && i.sender === sender)
                );
                const now = Date.now();
                if (existingIdx >= 0) {
                    pool[existingIdx].note = note || pool[existingIdx].note;
                    pool[existingIdx].color = color || pool[existingIdx].color || '';
                    pool[existingIdx].ts = now;
                } else {
                    const id = 'm-' + now.toString(36) + Math.random().toString(36).slice(2,6);
                    pool.unshift({
                        id, msgId: msgId || '',
                        text, sender, ts: now,
                        color: color || '',
                        note: note || '',
                        marker: markOwner,
                        from: sender==='usr'?userName:angleName
                    });
                }
                saveAppearance();
                showToast(markOwner==='usr' ? '已标注（我的标注）' : 'ta 已标注');
                closeMarkPickers();
            }
            if (markNoteCancel) markNoteCancel.addEventListener('click', () => { savePendingMark(''); });
            if (markNoteConfirm) markNoteConfirm.addEventListener('click', () => {
                const t = markNoteText ? markNoteText.value.trim() : '';
                savePendingMark(t);
            });
            if (markNoteText) markNoteText.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); markNoteConfirm && markNoteConfirm.click(); }
            });

            // ========== 收藏匣 & 标注 弹窗渲染 ==========
            const favList = document.getElementById('favList');
            const favSearchInput = document.getElementById('favSearchInput');
            const markList = document.getElementById('markList');
            const markSearchInput = document.getElementById('markSearchInput');
            let favCurTab = 'usr', markCurTab = 'usr';
            document.querySelectorAll('[data-favtab]').forEach(b => b.addEventListener('click', () => {
                document.querySelectorAll('[data-favtab]').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                favCurTab = b.dataset.favtab;
                renderFavList();
            }));
            document.querySelectorAll('[data-marktab]').forEach(b => b.addEventListener('click', () => {
                document.querySelectorAll('[data-marktab]').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                markCurTab = b.dataset.marktab;
                renderMarkList();
            }));
            if (favSearchInput) favSearchInput.addEventListener('input', renderFavList);
            if (markSearchInput) markSearchInput.addEventListener('input', renderMarkList);

            // 跳转到消息（按 msgId 或 按内容匹配）
            function jumpToMsg(item, typeLabel) {
                // 优先用 msgId 精确查找
                let target = null;
                if (item.msgId) target = document.querySelector(`.message[data-msg-id="${item.msgId}"]`);
                // 找不到再按内容+发送者匹配
                if (!target) {
                    const all = chatBox.querySelectorAll('.message');
                    for (const m of all) {
                        const s = m.dataset.sender;
                        const t = (m.querySelector('.msg-content')?.textContent || '').trim();
                        if (t === item.text && s === item.sender) { target = m; break; }
                    }
                }
                closeModal(favModal); closeModal(markModal);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 高亮闪一下
                    target.style.transition = 'box-shadow 0.3s, outline 0.3s';
                    target.style.outline = '2px solid #c79eff';
                    target.style.boxShadow = '0 0 20px rgba(199,158,255,0.5)';
                    setTimeout(() => {
                        target.style.outline = '';
                        target.style.boxShadow = '';
                    }, 1800);
                } else {
                    showToast('内容已被删除，无法跳转');
                }
            }

            function renderFavList() {
                if (!favList) return;
                const kw = (favSearchInput?.value || '').toLowerCase();
                const list = (favorites[favCurTab] || []).filter(i => !kw || i.text.toLowerCase().includes(kw));
                favList.innerHTML = '';
                if (!list.length) { favList.innerHTML = '<div class="lib-empty">暂无收藏</div>'; return; }
                list.forEach(item => {
                    const d = document.createElement('div');
                    d.className = 'lib-item';
                    d.innerHTML = `
                        <button class="lib-remove" title="删除收藏">✕</button>
                        <div class="lib-head"><span class="lib-sender">${item.from || (item.sender==='usr'?userName:angleName)}</span><span class="lib-ts">📅 ${formatDateCN(item.ts||Date.now())} ${formatTimestamp(new Date(item.ts||Date.now()), chatTimestampStyle)}</span></div>
                        <div class="lib-text"></div>
                        <button class="lib-jump" title="跳转至原消息">↗ 查看原消息</button>`;
                    d.querySelector('.lib-text').textContent = item.text;
                    d.querySelector('.lib-remove').addEventListener('click', (e) => {
                        e.stopPropagation();
                        favorites[favCurTab] = (favorites[favCurTab]||[]).filter(i => i.id !== item.id);
                        saveAppearance();
                        renderFavList();
                    });
                    d.querySelector('.lib-jump').addEventListener('click', (e) => {
                        e.stopPropagation();
                        jumpToMsg(item, '收藏');
                    });
                    d.addEventListener('click', () => {
                        userInput.value = item.text;
                        closeModal(favModal);
                        userInput.focus();
                    });
                    favList.appendChild(d);
                });
            }
            function renderMarkList() {
                if (!markList) return;
                const kw = (markSearchInput?.value || '').toLowerCase();
                const list = (marks[markCurTab] || []).filter(i => !kw || (i.text+' '+(i.note||'')).toLowerCase().includes(kw));
                markList.innerHTML = '';
                if (!list.length) { markList.innerHTML = '<div class="lib-empty">暂无标注</div>'; return; }
                list.forEach(item => {
                    const d = document.createElement('div');
                    d.className = 'lib-item';
                    if (item.color) d.style.background = item.color;
                    const noteBlock = item.note ? `<div class="lib-note">📝 ${item.note}</div>` : '';
                    d.innerHTML = `
                        <button class="lib-remove" title="删除标注">✕</button>
                        <div class="lib-head"><span class="lib-sender">${item.from || (item.sender==='usr'?userName:angleName)}</span><span class="lib-ts">📅 ${formatDateCN(item.ts||Date.now())} ${formatTimestamp(new Date(item.ts||Date.now()), chatTimestampStyle)}</span></div>
                        <div class="lib-text"></div>
                        ${noteBlock}
                        <button class="lib-jump" title="跳转至原消息">↗ 查看原消息</button>`;
                    d.querySelector('.lib-text').textContent = item.text;
                    d.querySelector('.lib-remove').addEventListener('click', (e) => {
                        e.stopPropagation();
                        marks[markCurTab] = (marks[markCurTab]||[]).filter(i => i.id !== item.id);
                        saveAppearance();
                        renderMarkList();
                    });
                    d.querySelector('.lib-jump').addEventListener('click', (e) => {
                        e.stopPropagation();
                        jumpToMsg(item, '标注');
                    });
                    markList.appendChild(d);
                });
            }

            // 清空全部
            const favClearAllBtn = document.getElementById('favClearAllBtn');
            const markClearAllBtn = document.getElementById('markClearAllBtn');
            if (favClearAllBtn) favClearAllBtn.addEventListener('click', () => {
                const cnt = (favorites[favCurTab] || []).length;
                if (!cnt) { showToast('当前没有收藏可清空'); return; }
                if (!confirm(`确定清空当前tab的${cnt}条收藏吗？（不可恢复）`)) return;
                favorites[favCurTab] = [];
                saveAppearance();
                renderFavList();
                showToast('已清空');
            });
            if (markClearAllBtn) markClearAllBtn.addEventListener('click', () => {
                const cnt = (marks[markCurTab] || []).length;
                if (!cnt) { showToast('当前没有标注可清空'); return; }
                if (!confirm(`确定清空当前tab的${cnt}条标注吗？（不可恢复）`)) return;
                marks[markCurTab] = [];
                saveAppearance();
                renderMarkList();
                showToast('已清空');
            });

            // ========== 底部/侧边：收藏匣 / 标注 / 设置按钮 ==========
            if (bottomFavBtn) bottomFavBtn.addEventListener('click', () => { closeBottomSheet(); renderFavList(); openModal(favModal); });
            if (bottomMarkBtn) bottomMarkBtn.addEventListener('click', () => { closeBottomSheet(); renderMarkList(); openModal(markModal); });
            if (bottomSettingsBtn) bottomSettingsBtn.addEventListener('click', () => { closeBottomSheet(); showSettingsView(null); openModal(settingsModal); });
            if (sideFavBtn) sideFavBtn.addEventListener('click', () => { closeSidePanel(); renderFavList(); openModal(favModal); });
            if (sideMarkBtn) sideMarkBtn.addEventListener('click', () => { closeSidePanel(); renderMarkList(); openModal(markModal); });
            if (sideSettingsBtn) sideSettingsBtn.addEventListener('click', () => { closeSidePanel(); showSettingsView(null); openModal(settingsModal); });
            if (closeFavModal) closeFavModal.addEventListener('click', () => closeModal(favModal));
            if (closeMarkModal) closeMarkModal.addEventListener('click', () => closeModal(markModal));
            [favModal, markModal].forEach(m => {
                if (m) m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
            });

            // 游戏模块（猜拳 / 涂鸦 / 你画我猜）事件绑定
            bindGameEvents();

            // 角色切换按钮
            const roleSwitchBtn = document.getElementById('roleSwitchBtn');
            const roleSwitcherModal = document.getElementById('roleSwitcherModal');
            if (roleSwitchBtn && roleSwitcherModal) {
                roleSwitchBtn.addEventListener('click', function(){
                    renderRoleSwitcher();
                    openModal(roleSwitcherModal);
                });
                const crs = document.getElementById('closeRoleSwitcher');
                if (crs) { crs.onclick = function(){ closeModal(roleSwitcherModal); }; roleSwitcherModal.addEventListener('click', function(e){ if (e.target === roleSwitcherModal) closeModal(roleSwitcherModal); }); }
            }
            // 新建角色
            const addRoleBtn = document.getElementById('addRoleBtn');
            const newRoleForm = document.getElementById('newRoleForm');
            if (addRoleBtn && newRoleForm) {
                addRoleBtn.onclick = function(){
                    newRoleForm.style.display = 'block';
                    document.getElementById('newRoleName').focus();
                };
                document.getElementById('cancelNewRole').onclick = function(){
                    newRoleForm.style.display = 'none';
                    document.getElementById('newRoleName').value = '';
                    document.getElementById('newRoleAvatar').value = '';
                };
                document.getElementById('confirmNewRole').onclick = function(){
                    var nm = document.getElementById('newRoleName').value.trim();
                    var av = document.getElementById('newRoleAvatar').value.trim() || '🌟';
                    if (!nm) { alert('请输入名称'); return; }
                    var r = addRole(nm, av);
                    newRoleForm.style.display = 'none';
                    document.getElementById('newRoleName').value = '';
                    document.getElementById('newRoleAvatar').value = '';
                    renderRoleSwitcher();
                    switchRole(r.id);
                    closeModal(roleSwitcherModal);
                };
            }
            // 新建群聊
            const addGroupBtn = document.getElementById('addGroupBtn');
            if (addGroupBtn) {
                addGroupBtn.onclick = function(){
                    var nm = prompt('群聊名称', '群聊');
                    if (!nm) return;
                    var av = prompt('群聊头像（emoji 或图片URL）', '👥') || '👥';
                    var nonGroup = roles.filter(function(r){ return !r.isGroup; });
                    var memberIds = nonGroup.length ? [nonGroup[0].id] : [];
                    var g = addGroupChat(nm, av, memberIds);
                    renderRoleSwitcher();
                    showToast('已创建群聊「'+nm+'」');
                };
            }

            // 顶栏梦女头像：单击进设置，双击拍一拍
            const dreamerAv = document.getElementById('dreamerAvatarDisplay');
            var dreamerClickTimer = null;
            if (dreamerAv) {
                dreamerAv.addEventListener('click', function(){
                    if (dreamerClickTimer) return;
                    dreamerClickTimer = setTimeout(function(){
                        dreamerClickTimer = null;
                        openModal(avatarModal);
                    }, 220);
                });
                dreamerAv.addEventListener('dblclick', function(ev){
                    ev.preventDefault();
                    if (dreamerClickTimer) { clearTimeout(dreamerClickTimer); dreamerClickTimer = null; }
                    addPatNotice(userName + ' 拍了拍 自己');
                });
            }

            // ========== 聊天设置功能 tab 状态同步 —— 所有开关统一双向绑定 ==========
            function bindChatSwitch(cbId, varName, onChange) {
                const el = document.getElementById(cbId);
                if (!el) return;
                el.checked = eval(varName); // 初始化 UI
                el.addEventListener('change', () => {
                    eval(varName + ' = el.checked;');
                    saveAppearance();
                    if (typeof onChange === 'function') onChange(el.checked);
                });
            }
            // 已有特殊逻辑的开关：quoteEnabled（关了要清 quoteBar）
            bindChatSwitch('chatQuoteEnabled', 'chatQuoteEnabled', (v) => { if (!v) { quoteMsg = null; clearQuoteBar(); } });
            // 下面 11 个开关之前**完全没绑定 change 事件**，用户改 UI 无效 —— 现在统一绑定
            bindChatSwitch('chatReadReceipt', 'chatReadReceipt');
            bindChatSwitch('chatReadNoReply', 'chatReadNoReply');
            bindChatSwitch('chatShowNickname', 'chatShowNickname');
            bindChatSwitch('chatEnterSend', 'chatEnterSend');
            bindChatSwitch('chatShowAvatar', 'chatShowAvatar');
            bindChatSwitch('chatShowTimestamp', 'chatShowTimestamp');
            bindChatSwitch('chatCallEnabled', 'chatCallEnabled');
            bindChatSwitch('chatLetterEnabled', 'chatLetterEnabled');
            bindChatSwitch('chatCustomReplyRule', 'chatCustomReplyRule');
            bindChatSwitch('chatMergeCards', 'chatMergeCards');
            bindChatSwitch('chatEmojiMix', 'chatEmojiMix');
            bindChatSwitch('chatKaomojiMix', 'chatKaomojiMix');
            bindChatSwitch('chatSoundMsg', 'chatSoundMsg');
            bindChatSwitch('chatSoundCall', 'chatSoundCall');
            // chatMergeCountSlider：拼字卡条数滑块同步
            const mcs = document.getElementById('chatMergeCountSlider');
            const mcval = document.getElementById('chatMergeCountVal');
            if (mcs) {
                mcs.value = chatMergeCount;
                if (mcval) mcval.textContent = chatMergeCount + ' 条';
                mcs.addEventListener('input', () => {
                    chatMergeCount = parseInt(mcs.value, 10) || 3;
                    if (mcval) mcval.textContent = chatMergeCount + ' 条';
                    saveAppearance();
                });
            }
            // time-stamp options 点击同步
            document.querySelectorAll('#chatTimestampOptions .ts-option').forEach(opt => {
                const v = opt.dataset.val;
                if (chatTimestampStyle === v) document.querySelectorAll('#chatTimestampOptions .ts-option').forEach(o => o.classList.remove('active'));
                if (chatTimestampStyle === v) opt.classList.add('active');
                opt.addEventListener('click', () => {
                    document.querySelectorAll('#chatTimestampOptions .ts-option').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    chatTimestampStyle = v;
                    saveAppearance();
                });
            });
            // 已读样式同步
            document.querySelectorAll('#chatReceiptStyle .style-option').forEach(opt => {
                const v = opt.dataset.val;
                if (chatReadStyle === v) document.querySelectorAll('#chatReceiptStyle .style-option').forEach(o => o.classList.remove('active'));
                if (chatReadStyle === v) opt.classList.add('active');
                opt.addEventListener('click', () => {
                    document.querySelectorAll('#chatReceiptStyle .style-option').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    chatReadStyle = v;
                    saveAppearance();
                });
            });

            // ========== 颜文字 + Emoji符号 + 图片表情包 + 信封 ==========
            // ===== 标签切换：三分类（颜文字 / Emoji符号 / 图片） =====
            const kaomojiSection = document.getElementById('kaomojiSection');
            const emojiSymbolSection = document.getElementById('emojiSymbolSection');
            const emojiImgSection = document.getElementById('emojiImgSection');
            document.querySelectorAll('[data-sticker-tab]').forEach(b => b.addEventListener('click', () => {
                document.querySelectorAll('[data-sticker-tab]').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                const tab = b.dataset.stickerTab;
                if (kaomojiSection) kaomojiSection.style.display = tab === 'kaomoji' ? '' : 'none';
                if (emojiSymbolSection) emojiSymbolSection.style.display = tab === 'emoji-symbol' ? '' : 'none';
                if (emojiImgSection) emojiImgSection.style.display = tab === 'emoji-img' ? '' : 'none';
            }));

            // ===== 颜文字（替代原 emojiGroups 文本表情）=====
            let kaoGroupTabs = document.getElementById('kaoGroupTabs');
            let kaoList = document.getElementById('kaoList');
            let kaoSearchInput = document.getElementById('kaoSearchInput');
            let kaoBatchInput = document.getElementById('kaoBatchInput');
            let kaoBatchImportBtn = document.getElementById('kaoBatchImportBtn');
            let kaoClearBatchBtn = document.getElementById('kaoClearBatchBtn');
            let kaoBatchGroupSelect = document.getElementById('kaoBatchGroupSelect');
            let kaoInput = document.getElementById('kaoInput');
            let kaoGroupSelect = document.getElementById('kaoGroupSelect');
            let addKaoBtn = document.getElementById('addKaoBtn');
            let kaoGroupInput = document.getElementById('kaoGroupInput');
            let kaoAddGroupBtn = document.getElementById('kaoAddGroupBtn');
            let kaoDeleteGroupBtn = document.getElementById('kaoDeleteGroupBtn');
            let kaoSelectBtn = document.getElementById('kaoSelectBtn');
            let kaoDeleteSelectedBtn = document.getElementById('kaoDeleteSelectedBtn');
            let kaoSelectInfo = document.getElementById('kaoSelectInfo');
            let kaoMoveRow = document.getElementById('kaoMoveRow');
            let kaoMoveBtn = document.getElementById('kaoMoveBtn');
            let kaoMoveGroupSelect = document.getElementById('kaoMoveGroupSelect');
            let clearKaoBtn = document.getElementById('clearKaoBtn');
            let resetKaoBtn = document.getElementById('resetKaoBtn');
            let kaoAllCount = document.getElementById('kaoAllCount');
            let kaoLibraryFlat = [];
            function refreshKaoFlat() {
                kaoLibraryFlat = [];
                for (const g in kaomojiGroups) kaoLibraryFlat = kaoLibraryFlat.concat(kaomojiGroups[g]);
            }
            function renderKaoGroups() {
                if (!kaoGroupTabs) return;
                kaoGroupTabs.innerHTML = `<span class="mod-group-tab ${kaoCurrentGroup==='all'?'active':''}" data-group="all">全部 <span class="count" id="kaoAllCount">${kaoLibraryFlat.length}</span></span>`;
                kaomojiGroupList.forEach(g => {
                    const len = (kaomojiGroups[g]||[]).length;
                    const s = document.createElement('span');
                    s.className = 'mod-group-tab' + (kaoCurrentGroup===g?' active':'');
                    s.dataset.group = g;
                    s.innerHTML = `${g} <span class="count">${len}</span>`;
                    kaoGroupTabs.appendChild(s);
                });
                kaoGroupTabs.querySelectorAll('[data-group]').forEach(t => t.addEventListener('click', () => {
                    kaoCurrentGroup = t.dataset.group;
                    renderKaoGroups(); renderKaos();
                }));
                // 同步所有 select
                [kaoBatchGroupSelect, kaoGroupSelect, kaoMoveGroupSelect].forEach(sel => {
                    if (!sel) return;
                    const cur = sel.value;
                    sel.innerHTML = '';
                    kaomojiGroupList.forEach(g => {
                        const o = document.createElement('option');
                        o.value = g; o.textContent = g; sel.appendChild(o);
                    });
                    if (kaomojiGroupList.includes(cur)) sel.value = cur;
                });
            }
            function renderKaos() {
                if (!kaoList) return;
                refreshKaoFlat();
                const kw = (kaoSearchInput?.value || '').toLowerCase();
                let src = [];
                if (kaoCurrentGroup === 'all') for (const g in kaomojiGroups) {
                    (kaomojiGroups[g]||[]).forEach(v => src.push({ group:g, value:v }));
                } else (kaomojiGroups[kaoCurrentGroup]||[]).forEach(v => src.push({ group:kaoCurrentGroup, value:v }));
                if (kw) src = src.filter(x => (x.value||'').toLowerCase().includes(kw));
                kaoList.innerHTML = '';
                if (!src.length) { kaoList.innerHTML = '<span class="mod-empty">暂无颜文字</span>'; renderKaoGroups(); return; }
                src.forEach(({group, value}) => {
                    const d = document.createElement('div');
                    d.className = 'kao-item' + (kaoSelected.has(group+'|'+value)?' selected':'');
                    d.innerHTML = `
                        <div class="kao-head"><span class="kao-group-tag">${group}</span></div>
                        <div class="kao-body"></div>
                        <button class="kao-del" title="删除">✕</button>`;
                    d.querySelector('.kao-body').textContent = value;
                    if (kaoSelectMode) {
                        d.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const key = group+'|'+value;
                            if (kaoSelected.has(key)) kaoSelected.delete(key);
                            else kaoSelected.add(key);
                            renderKaos();
                        });
                    } else {
                        d.addEventListener('click', () => {
                            userInput.value += value;
                            userInput.focus();
                            closeModal(emojiModal);
                        });
                    }
                    d.querySelector('.kao-del').addEventListener('click', (e) => {
                        e.stopPropagation();
                        kaomojiGroups[group] = (kaomojiGroups[group]||[]).filter(x => x !== value);
                        kaoSelected.delete(group+'|'+value);
                        saveAppearance();
                        renderKaos();
                    });
                    kaoList.appendChild(d);
                });
                if (kaoSelectInfo) kaoSelectInfo.textContent = `已选 ${kaoSelected.size}`;
                renderKaoGroups();
            }
            // 分组 select 事件
            if (addKaoBtn) addKaoBtn.addEventListener('click', () => {
                const t = (kaoInput?.value || '');
                if (!t.trim()) { showToast('请输入/粘贴颜文字'); return; }
                const g = kaoGroupSelect?.value || 'default';
                if (!kaomojiGroups[g]) kaomojiGroups[g] = [];
                if (kaomojiGroups[g].includes(t)) { showToast('已存在'); return; }
                kaomojiGroups[g].push(t);
                kaoInput.value = '';
                saveAppearance(); renderKaos(); showToast('已添加');
            });
            if (kaoBatchInput) kaoBatchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey||e.metaKey)) { e.preventDefault(); kaoBatchImportBtn && kaoBatchImportBtn.click(); }
            });
            if (kaoBatchImportBtn) kaoBatchImportBtn.addEventListener('click', () => {
                // 多条之间按独立行的 '---'（3个连字符）分隔
                const raw = kaoBatchInput?.value || '';
                if (!raw.trim()) { showToast('请输入内容'); return; }
                const items = raw.split(/^\s*---+\s*$/m).map(s => s.replace(/^\n+|\n+$/g, '')).filter(s => s.trim());
                if (!items.length) { showToast('没有有效内容'); return; }
                const g = kaoBatchGroupSelect?.value || 'default';
                if (!kaomojiGroups[g]) kaomojiGroups[g] = [];
                let added = 0;
                items.forEach(it => {
                    if (!kaomojiGroups[g].includes(it)) { kaomojiGroups[g].push(it); added++; }
                });
                kaoBatchInput.value = '';
                saveAppearance(); renderKaos();
                showToast(`导入 ${added} 条颜文字（共 ${items.length} 条）`);
            });
            if (kaoClearBatchBtn) kaoClearBatchBtn.addEventListener('click', () => { kaoBatchInput.value = ''; });
            if (kaoAddGroupBtn) kaoAddGroupBtn.addEventListener('click', () => {
                const n = (kaoGroupInput?.value || '').trim();
                if (!n) { showToast('请输入分组名'); return; }
                if (kaomojiGroupList.includes(n)) { showToast('分组已存在'); return; }
                kaomojiGroupList.push(n); kaomojiGroups[n] = [];
                kaoGroupInput.value = ''; saveAppearance(); renderKaos();
            });
            if (kaoDeleteGroupBtn) kaoDeleteGroupBtn.addEventListener('click', () => {
                const cur = kaoCurrentGroup;
                if (cur === 'all' || !kaomojiGroupList.includes(cur)) { showToast('请先选择一个分组'); return; }
                if (cur === 'default') { showToast('默认分组不能删除'); return; }
                if (!confirm(`删除分组「${cur}」？组内 ${(kaomojiGroups[cur]||[]).length} 条将一同删除`)) return;
                kaomojiGroupList = kaomojiGroupList.filter(x => x !== cur);
                delete kaomojiGroups[cur]; kaoCurrentGroup = 'all';
                saveAppearance(); renderKaos();
            });
            if (kaoSelectBtn) kaoSelectBtn.addEventListener('click', () => {
                kaoSelectMode = !kaoSelectMode;
                if (!kaoSelectMode) kaoSelected.clear();
                kaoDeleteSelectedBtn.style.display = kaoSelectMode ? '' : 'none';
                kaoMoveRow.style.display = kaoSelectMode ? 'flex' : 'none';
                kaoSelectBtn.textContent = kaoSelectMode ? '✕ 取消选择' : '☑ 选择';
                renderKaos();
            });
            if (kaoDeleteSelectedBtn) kaoDeleteSelectedBtn.addEventListener('click', () => {
                if (!kaoSelected.size) return;
                kaoSelected.forEach(key => {
                    const [g, v] = key.split('|');
                    if (kaomojiGroups[g]) kaomojiGroups[g] = kaomojiGroups[g].filter(x => x !== v);
                });
                kaoSelected.clear(); saveAppearance(); renderKaos();
            });
            if (kaoMoveBtn) kaoMoveBtn.addEventListener('click', () => {
                if (!kaoSelected.size) return;
                const tg = kaoMoveGroupSelect?.value || 'default';
                if (!kaomojiGroups[tg]) kaomojiGroups[tg] = [];
                let moved = 0;
                kaoSelected.forEach(key => {
                    const [g, v] = key.split('|');
                    if (g === tg) return;
                    if (kaomojiGroups[g]) kaomojiGroups[g] = kaomojiGroups[g].filter(x => x !== v);
                    if (!kaomojiGroups[tg].includes(v)) { kaomojiGroups[tg].push(v); moved++; }
                });
                kaoSelected.clear(); saveAppearance(); renderKaos(); showToast(`移动 ${moved} 条到「${tg}」`);
            });
            if (clearKaoBtn) clearKaoBtn.addEventListener('click', () => {
                if (!kaoLibraryFlat.length) return;
                if (!confirm('清空所有颜文字？（不可恢复）')) return;
                for (const g of kaomojiGroupList) kaomojiGroups[g] = [];
                kaoSelected.clear(); saveAppearance(); renderKaos(); showToast('已清空');
            });
            if (resetKaoBtn) resetKaoBtn.addEventListener('click', () => {
                if (!confirm('恢复默认颜文字？（覆盖当前）')) return;
                kaomojiGroups = { default: [...DEFAULT_KAOMOJIS] };
                kaomojiGroupList = ['default']; kaoCurrentGroup = 'all'; kaoSelected.clear(); kaoSelectMode = false;
                saveAppearance(); renderKaos(); showToast('已恢复默认');
            });
            if (kaoSearchInput) kaoSearchInput.addEventListener('input', renderKaos);

            // ===== Emoji 符号（Unicode 字符表情：😣 😊 😴 这类，对应 emojiGroups；三分类第二板块） =====
            let emSymGroupTabs = document.getElementById('emSymGroupTabs');
            let emSymList = document.getElementById('emSymList');
            let emSymSearchInput = document.getElementById('emSymSearchInput');
            let emSymInput = document.getElementById('emSymInput');
            let emSymGroupSelect = document.getElementById('emSymGroupSelect');
            let addEmSymBtn = document.getElementById('addEmSymBtn');
            let emSymGroupInput = document.getElementById('emSymGroupInput');
            let emSymAddGroupBtn = document.getElementById('emSymAddGroupBtn');
            let emSymDeleteGroupBtn = document.getElementById('emSymDeleteGroupBtn');
            let emSymSelectBtn = document.getElementById('emSymSelectBtn');
            let emSymDeleteSelectedBtn = document.getElementById('emSymDeleteSelectedBtn');
            let emSymSelectInfo = document.getElementById('emSymSelectInfo');
            let emSymMoveRow = document.getElementById('emSymMoveRow');
            let emSymMoveGroupSelect = document.getElementById('emSymMoveGroupSelect');
            let emSymMoveBtn = document.getElementById('emSymMoveBtn');
            let clearEmSymBtn = document.getElementById('clearEmSymBtn');
            let resetEmSymBtn = document.getElementById('resetEmSymBtn');
            let emSymAllCount = document.getElementById('emSymAllCount');
            let emSymSelectMode = false;
            function renderEmSymGroups() {
                if (!emSymGroupTabs) return;
                let total = 0;
                for (const g in emojiGroups) total += emojiGroups[g].length;
                emSymGroupTabs.innerHTML = `<span class="mod-group-tab ${emojiCurrentGroup==='all'?'active':''}" data-group="all">全部 <span class="count" id="emSymAllCount">${total}</span></span>`;
                emojiGroupList.forEach(g => {
                    const len = (emojiGroups[g]||[]).length;
                    const s = document.createElement('span');
                    s.className = 'mod-group-tab ' + (emojiCurrentGroup===g ? 'active' : '');
                    s.dataset.group = g;
                    s.innerHTML = `${g} <span class="count">${len}</span>`;
                    emSymGroupTabs.appendChild(s);
                });
                emSymGroupTabs.querySelectorAll('[data-group]').forEach(t => t.addEventListener('click', () => {
                    emojiCurrentGroup = t.dataset.group;
                    renderEmSymGroups(); renderEmSyms();
                }));
                const emSymJsonGroupSelect = document.getElementById('emSymJsonGroupSelect');
                [emSymGroupSelect, emSymMoveGroupSelect, emSymJsonGroupSelect].forEach(sel => {
                    if (!sel) return;
                    const cur = sel.value;
                    sel.innerHTML = '';
                    emojiGroupList.forEach(g => {
                        const o = document.createElement('option');
                        o.value = g; o.textContent = g;
                        sel.appendChild(o);
                    });
                    if (emojiGroupList.includes(cur)) sel.value = cur;
                });
                if (emSymAllCount) emSymAllCount.textContent = String(total);
            }
            function renderEmSyms() {
                if (!emSymList) return;
                let items = emojiCurrentGroup === 'all'
                    ? (function(){ let a = []; for (const g in emojiGroups) a = a.concat(emojiGroups[g].map(v=>({group:g,value:v}))); return a; })()
                    : (emojiGroups[emojiCurrentGroup]||[]).map(v => ({group:emojiCurrentGroup, value:v}));
                const kw = (emSymSearchInput?.value || '').toLowerCase();
                if (kw) items = items.filter(x => x.value.toLowerCase().includes(kw));
                emSymList.innerHTML = '';
                if (!items.length) {
                    const e = document.createElement('span');
                    e.className = 'mod-empty';
                    e.style.gridColumn = '1/-1';
                    e.textContent = kw ? '未找到匹配 Emoji' : (emojiCurrentGroup==='all' ? '暂无 Emoji 符号' : '「'+emojiCurrentGroup+'」为空');
                    emSymList.appendChild(e);
                } else {
                    items.forEach(({group, value}) => {
                        const key = group+'|'+value;
                        const d = document.createElement('div');
                        d.className = 'em-img-item' + (emojiSelected.has(key) ? ' selected' : '');
                        d.style.cssText = 'aspect-ratio:1/1;border-radius:12px;background:rgba(255,255,255,0.6);border:1px solid rgba(200,170,220,0.25);display:flex;align-items:center;justify-content:center;font-size:1.8rem;cursor:pointer;transition:0.15s;position:relative;user-select:none;';
                        d.textContent = value;
                        d.title = value;
                        if (emSymSelectMode) {
                            if (emojiSelected.has(key)) {
                                d.style.background = 'linear-gradient(135deg,#b58aff,#e49cff)';
                                d.style.color = '#fff';
                                d.style.boxShadow = '0 0 0 2px #c6a8de inset';
                            }
                            d.addEventListener('click', () => {
                                if (emojiSelected.has(key)) emojiSelected.delete(key);
                                else emojiSelected.add(key);
                                renderEmSyms();
                            });
                            const del = document.createElement('span');
                            del.className = 'del';
                            del.style.cssText = 'position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#e74c3c;color:#fff;font-size:0.7rem;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;';
                            del.textContent = '✕';
                            del.addEventListener('click', function(e) {
                                e.stopPropagation();
                                emojiGroups[group] = (emojiGroups[group]||[]).filter(x => x !== value);
                                emojiSelected.delete(key);
                                saveAppearance(); renderEmSyms(); renderEmSymGroups();
                            });
                            d.appendChild(del);
                        } else {
                            d.addEventListener('click', () => {
                                if (typeof userInput !== 'undefined' && userInput) { userInput.value += value; userInput.focus(); }
                                closeModal(emojiModal);
                            });
                        }
                        emSymList.appendChild(d);
                    });
                }
                if (emSymSelectInfo) emSymSelectInfo.textContent = '已选 '+emojiSelected.size;
                if (emSymDeleteSelectedBtn) emSymDeleteSelectedBtn.style.display = emSymSelectMode ? '' : 'none';
                if (emSymMoveRow) emSymMoveRow.style.display = emSymSelectMode ? '' : 'none';
                if (emSymSelectBtn) emSymSelectBtn.textContent = emSymSelectMode ? '✔ 取消' : '☑ 选择';
            }
            function addEmSym() {
                const raw = (emSymInput?.value || '').trim();
                if (!raw) { showToast('请输入 Emoji 符号'); return; }
                const grp = (emSymGroupSelect?.value || 'default') || 'default';
                if (!emojiGroups[grp]) emojiGroups[grp] = [];
                // Array.from 按 code point 拆分，正确处理 surrogate pair emoji
                const symbols = Array.from(raw).filter(c => c && c.trim().length);
                let added = 0;
                symbols.forEach(s => {
                    if (!emojiGroups[grp].includes(s)) { emojiGroups[grp].push(s); added++; }
                });
                if (!added) { showToast('全部已存在'); if (emSymInput) emSymInput.value=''; return; }
                saveAppearance(); renderEmSyms(); renderEmSymGroups();
                if (emSymInput) emSymInput.value = '';
                showToast('已添加 '+added+' 个 Emoji');
            }
            if (addEmSymBtn) addEmSymBtn.addEventListener('click', addEmSym);
            if (emSymInput) emSymInput.addEventListener('keydown', e => { if (e.key === 'Enter') addEmSym(); });
            // Emoji 符号 JSON 批量导入
            function jsonImportEmSym() {
                const sel = document.getElementById('emSymJsonGroupSelect');
                const ta = document.getElementById('emSymJsonInput');
                if (!ta) return;
                const n = importJsonGroups(ta.value, sel, emojiGroups, emojiGroupList, () => { renderEmSyms(); renderEmSymGroups(); }, 'Emoji');
                if (n > 0) { ta.value = ''; saveAppearance(); showToast(`JSON 导入 ${n} 个 Emoji`); }
            }
            const emSymJsonImportBtn = document.getElementById('emSymJsonImportBtn');
            if (emSymJsonImportBtn) emSymJsonImportBtn.addEventListener('click', jsonImportEmSym);
            if (emSymGroupInput && emSymAddGroupBtn) emSymAddGroupBtn.addEventListener('click', () => {
                const g = (emSymGroupInput.value || '').trim();
                if (!g) return showToast('请输入分组名');
                if (emojiGroupList.includes(g)) return showToast('分组已存在');
                emojiGroupList.push(g); emojiGroups[g] = [];
                saveAppearance(); renderEmSymGroups();
                emSymGroupInput.value = '';
                showToast('分组已创建');
            });
            if (emSymDeleteGroupBtn) emSymDeleteGroupBtn.addEventListener('click', () => {
                const g = (emSymGroupSelect?.value || 'default');
                if (!g || g === 'default') return showToast('默认分组不可删除');
                if (!confirm('删除分组「'+g+'」？组内 Emoji 将一并移除。')) return;
                emojiGroupList = emojiGroupList.filter(x => x !== g);
                delete emojiGroups[g];
                if (emojiCurrentGroup === g) emojiCurrentGroup = 'all';
                saveAppearance(); renderEmSymGroups(); renderEmSyms();
                showToast('分组已删除');
            });
            if (emSymSelectBtn) emSymSelectBtn.addEventListener('click', () => {
                emSymSelectMode = !emSymSelectMode;
                if (!emSymSelectMode) emojiSelected.clear();
                renderEmSyms();
            });
            if (emSymDeleteSelectedBtn) emSymDeleteSelectedBtn.addEventListener('click', () => {
                if (!emojiSelected.size) return showToast('未选中');
                if (!confirm('删除选中的 '+emojiSelected.size+' 个 Emoji？')) return;
                emojiSelected.forEach(key => {
                    const [g, v] = key.split('|');
                    if (emojiGroups[g]) emojiGroups[g] = emojiGroups[g].filter(x => x !== v);
                });
                emojiSelected.clear(); emSymSelectMode = false;
                saveAppearance(); renderEmSyms(); renderEmSymGroups();
                showToast('已删除');
            });
            if (emSymMoveBtn) emSymMoveBtn.addEventListener('click', () => {
                const tgt = (emSymMoveGroupSelect?.value || '');
                if (!tgt || !emojiSelected.size) return;
                let moved = 0;
                emojiSelected.forEach(key => {
                    const [g, v] = key.split('|');
                    if (g === tgt) return;
                    if (emojiGroups[g]) emojiGroups[g] = emojiGroups[g].filter(x => x !== v);
                    if (!emojiGroups[tgt]) emojiGroups[tgt] = [];
                    if (!emojiGroups[tgt].includes(v)) { emojiGroups[tgt].push(v); moved++; }
                });
                emojiSelected.clear(); emSymSelectMode = false;
                saveAppearance(); renderEmSyms(); renderEmSymGroups();
                showToast('已移动 '+moved+' 个');
            });
            if (clearEmSymBtn) clearEmSymBtn.addEventListener('click', () => {
                const cnt = Object.values(emojiGroups).reduce((a,b)=>a+b.length,0);
                if (!cnt) return showToast('当前没有 Emoji 可清空');
                if (!confirm('清空全部 '+cnt+' 个 Emoji 符号？（不可恢复）')) return;
                for (const g of emojiGroupList) emojiGroups[g] = [];
                emojiSelected.clear(); emSymSelectMode = false; saveAppearance(); renderEmSyms(); renderEmSymGroups();
                showToast('已清空');
            });
            if (resetEmSymBtn) resetEmSymBtn.addEventListener('click', () => {
                const curCnt = Object.values(emojiGroups).reduce((a,b)=>a+b.length,0);
                if (curCnt && !confirm('恢复默认 Emoji 符号？当前自定义内容将丢失。')) return;
                emojiGroups = { default: [...DEFAULT_KAOMOJIS] };
                emojiGroupList = ['default'];
                emojiCurrentGroup = 'all';
                emojiSelected.clear(); emSymSelectMode = false;
                saveAppearance(); renderEmSyms(); renderEmSymGroups();
                showToast('已恢复默认');
            });
            if (emSymSearchInput) emSymSearchInput.addEventListener('input', renderEmSyms);

            // ===== emoji 图片 =====
            let emImgList = document.getElementById('emImgList');
            let emImgSearchInput = document.getElementById('emImgSearchInput');
            let emImgUrlInput = document.getElementById('emImgUrlInput');
            let emImgAddUrlBtn = document.getElementById('emImgAddUrlBtn');
            let emImgPickFileBtn = document.getElementById('emImgPickFileBtn');
            let emImgPickAlbumBtn = document.getElementById('emImgPickAlbumBtn');
            let emImgFileInput = document.getElementById('emImgFileInput');
            let emImgAlbumInput = document.getElementById('emImgAlbumInput');
            let emImgTargetGroup = document.getElementById('emImgTargetGroup');
            let emImgBatchUrlInput = document.getElementById('emImgBatchUrlInput');
            let emImgBatchUrlBtn = document.getElementById('emImgBatchUrlBtn');
            let emImgClearBatchUrlBtn = document.getElementById('emImgClearBatchUrlBtn');
            let emImgBatchGroupSelect = document.getElementById('emImgBatchGroupSelect');
            let emImgGroupInput = document.getElementById('emImgGroupInput');
            let emImgAddGroupBtn = document.getElementById('emImgAddGroupBtn');
            let emImgDeleteGroupBtn = document.getElementById('emImgDeleteGroupBtn');
            let emImgGroupTabs = document.getElementById('emImgGroupTabs');
            let emImgSelectBtn = document.getElementById('emImgSelectBtn');
            let emImgDeleteSelectedBtn = document.getElementById('emImgDeleteSelectedBtn');
            let emImgSelectInfo = document.getElementById('emImgSelectInfo');
            let emImgMoveRow = document.getElementById('emImgMoveRow');
            let emImgMoveBtn = document.getElementById('emImgMoveBtn');
            let emImgMoveGroupSelect = document.getElementById('emImgMoveGroupSelect');
            let clearEmImgBtn = document.getElementById('clearEmImgBtn');
            let emImgAllCount = document.getElementById('emImgAllCount');
            function emImgAll() {
                const all = [];
                for (const g in emojiImgGroups) (emojiImgGroups[g]||[]).forEach(item => all.push({...item, _group:g}));
                return all;
            }
            function renderEmImgGroups() {
                if (!emImgGroupTabs) return;
                const all = emImgAll().length;
                emImgGroupTabs.innerHTML = `<span class="mod-group-tab ${emImgCurrentGroup==='all'?'active':''}" data-group="all">全部 <span class="count" id="emImgAllCount">${all}</span></span>`;
                emojiImgGroupList.forEach(g => {
                    const len = (emojiImgGroups[g]||[]).length;
                    const s = document.createElement('span');
                    s.className = 'mod-group-tab' + (emImgCurrentGroup===g?' active':'');
                    s.dataset.group = g;
                    s.innerHTML = `${g} <span class="count">${len}</span>`;
                    emImgGroupTabs.appendChild(s);
                });
                emImgGroupTabs.querySelectorAll('[data-group]').forEach(t => t.addEventListener('click', () => {
                    emImgCurrentGroup = t.dataset.group;
                    renderEmImgGroups(); renderEmImgs();
                }));
                [emImgTargetGroup, emImgBatchGroupSelect, emImgMoveGroupSelect].forEach(sel => {
                    if (!sel) return;
                    const cur = sel.value;
                    sel.innerHTML = '';
                    emojiImgGroupList.forEach(g => {
                        const o = document.createElement('option');
                        o.value = g; o.textContent = g; sel.appendChild(o);
                    });
                    if (emojiImgGroupList.includes(cur)) sel.value = cur;
                });
            }
            function renderEmImgs() {
                if (!emImgList) return;
                const kw = (emImgSearchInput?.value || '').toLowerCase();
                let list = [];
                if (emImgCurrentGroup === 'all') list = emImgAll();
                else list = (emojiImgGroups[emImgCurrentGroup]||[]).map(x => ({...x, _group:emImgCurrentGroup}));
                if (kw) list = list.filter(x => (x.name||'').toLowerCase().includes(kw) || (x.url||'').toLowerCase().includes(kw));
                emImgList.innerHTML = '';
                if (!list.length) { emImgList.innerHTML = '<span class="mod-empty" style="grid-column:1/-1;">暂无 emoji 图片</span>'; renderEmImgGroups(); return; }
                list.forEach(item => {
                    const d = document.createElement('div');
                    d.className = 'em-img-item' + (emImgSelected.has(item.id)?' selected':'');
                    const imgsrc = item.url || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect width=%2240%22 height=%2240%22 fill=%22%23eee%22/><text x=%2220%22 y=%2222%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%23aaa%22>?</text></svg>';
                    d.innerHTML = `<img src="" alt=""><button class="em-img-del" title="删除">✕</button><span class="em-img-group"></span><span class="em-img-name"></span>`;
                    const img = d.querySelector('img'); img.setAttribute('loading','lazy'); img.src = imgsrc; img.onerror = () => { img.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect width=%2240%22 height=%2240%22 fill=%22%23f7e7ef%22/><text x=%2220%22 y=%2222%22 text-anchor=%22middle%22 font-size=%229%22 fill=%22%23c24273%22>失效</text></svg>'; };
                    d.querySelector('.em-img-group').textContent = item._group;
                    d.querySelector('.em-img-name').textContent = item.name || (item.url||'').slice(0, 12);
                    d.querySelector('.em-img-del').addEventListener('click', (e) => {
                        e.stopPropagation();
                        emojiImgGroups[item._group] = (emojiImgGroups[item._group]||[]).filter(x => x.id !== item.id);
                        emImgSelected.delete(item.id); saveAppearance(); renderEmImgs();
                    });
                    if (emImgSelectMode) {
                        d.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (emImgSelected.has(item.id)) emImgSelected.delete(item.id);
                            else emImgSelected.add(item.id);
                            renderEmImgs();
                        });
                    } else {
                        d.addEventListener('click', (e) => {
                            e.stopPropagation();
                            closeModal(emojiModal);
                            sendEmojiImage(item.url);
                        });
                    }
                    emImgList.appendChild(d);
                });
                if (emImgSelectInfo) emImgSelectInfo.textContent = `已选 ${emImgSelected.size}`;
                renderEmImgGroups();
            }
            function addEmImgUrl(url, group) {
                const u = (url||'').trim();
                if (!u) return 0;
                if (!/^(https?:|data:image\/|\/|\.)/i.test(u)) { showToast('URL 格式不正确'); return 0; }
                const g = group || 'default';
                if (!emojiImgGroups[g]) emojiImgGroups[g] = [];
                if (emojiImgGroups[g].some(x => x.url === u)) { showToast('该图片URL已存在于该分组'); return 0; }
                const name = u.split('/').pop().slice(0, 20) || 'image';
                emojiImgGroups[g].push({ id: 'ei-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), url:u, name });
                return 1;
            }
            if (emImgAddUrlBtn) emImgAddUrlBtn.addEventListener('click', () => {
                const u = emImgUrlInput?.value || '';
                const g = emImgTargetGroup?.value || 'default';
                const n = addEmImgUrl(u, g);
                if (n) { emImgUrlInput.value = ''; saveAppearance(); renderEmImgs(); showToast('已添加'); }
            });
            if (emImgPickFileBtn) emImgPickFileBtn.addEventListener('click', () => emImgFileInput && emImgFileInput.click());
            if (emImgPickAlbumBtn) emImgPickAlbumBtn.addEventListener('click', () => emImgAlbumInput && emImgAlbumInput.click());
            function handleEmImgFiles(fileList) {
                if (!fileList || !fileList.length) return;
                const g = emImgTargetGroup?.value || 'default';
                if (!emojiImgGroups[g]) emojiImgGroups[g] = [];
                let loaded = 0, fails = 0, total = fileList.length;
                Array.from(fileList).forEach(f => {
                    if (!f.type.startsWith('image/')) { fails++; if (loaded + fails === total) finalize(); return; }
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const url = e.target.result;
                            if (!emojiImgGroups[g].some(x => x.url === url)) {
                                emojiImgGroups[g].push({ id: 'ei-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), url, name: f.name || 'image' });
                                loaded++;
                            }
                        } catch (err) { fails++; }
                        if (loaded + fails >= total) finalize();
                    };
                    reader.onerror = () => { fails++; if (loaded + fails >= total) finalize(); };
                    reader.readAsDataURL(f);
                });
                function finalize() {
                    if (loaded) { saveAppearance(); renderEmImgs(); showToast(`导入 ${loaded} 张图片${fails?'，失败 '+fails+' 张':''}`); }
                    else if (fails) showToast('全部导入失败');
                }
            }
            if (emImgFileInput) emImgFileInput.addEventListener('change', function() { handleEmImgFiles(this.files); this.value = ''; });
            if (emImgAlbumInput) emImgAlbumInput.addEventListener('change', function() { handleEmImgFiles(this.files); this.value = ''; });
            if (emImgBatchUrlBtn) emImgBatchUrlBtn.addEventListener('click', () => {
                const raw = emImgBatchUrlInput?.value || '';
                const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
                if (!lines.length) { showToast('请输入URL'); return; }
                const g = emImgBatchGroupSelect?.value || 'default';
                let added = 0;
                lines.forEach(u => added += addEmImgUrl(u, g));
                emImgBatchUrlInput.value = '';
                if (added) { saveAppearance(); renderEmImgs(); }
                showToast(`导入 ${added}/${lines.length} 条`);
            });
            if (emImgClearBatchUrlBtn) emImgClearBatchUrlBtn.addEventListener('click', () => { emImgBatchUrlInput.value = ''; });
            if (emImgAddGroupBtn) emImgAddGroupBtn.addEventListener('click', () => {
                const n = (emImgGroupInput?.value||'').trim();
                if (!n) { showToast('请输入分组名'); return; }
                if (emojiImgGroupList.includes(n)) { showToast('分组已存在'); return; }
                emojiImgGroupList.push(n); emojiImgGroups[n] = [];
                emImgGroupInput.value = ''; saveAppearance(); renderEmImgs();
            });
            if (emImgDeleteGroupBtn) emImgDeleteGroupBtn.addEventListener('click', () => {
                const cur = emImgCurrentGroup;
                if (cur === 'all' || !emojiImgGroupList.includes(cur)) { showToast('请先选择一个分组'); return; }
                if (cur === 'default') { showToast('默认分组不能删除'); return; }
                if (!confirm(`删除分组「${cur}」？组内 ${(emojiImgGroups[cur]||[]).length} 张将一同删除`)) return;
                emojiImgGroupList = emojiImgGroupList.filter(x => x !== cur);
                delete emojiImgGroups[cur]; emImgCurrentGroup = 'all';
                saveAppearance(); renderEmImgs();
            });
            if (emImgSelectBtn) emImgSelectBtn.addEventListener('click', () => {
                emImgSelectMode = !emImgSelectMode;
                if (!emImgSelectMode) emImgSelected.clear();
                emImgDeleteSelectedBtn.style.display = emImgSelectMode ? '' : 'none';
                emImgMoveRow.style.display = emImgSelectMode ? 'flex' : 'none';
                emImgSelectBtn.textContent = emImgSelectMode ? '✕ 取消选择' : '☑ 选择';
                renderEmImgs();
            });
            if (emImgDeleteSelectedBtn) emImgDeleteSelectedBtn.addEventListener('click', () => {
                if (!emImgSelected.size) return;
                for (const g in emojiImgGroups) emojiImgGroups[g] = (emojiImgGroups[g]||[]).filter(x => !emImgSelected.has(x.id));
                emImgSelected.clear(); saveAppearance(); renderEmImgs();
            });
            if (emImgMoveBtn) emImgMoveBtn.addEventListener('click', () => {
                if (!emImgSelected.size) return;
                const tg = emImgMoveGroupSelect?.value || 'default';
                if (!emojiImgGroups[tg]) emojiImgGroups[tg] = [];
                let moved = 0;
                for (const g in emojiImgGroups) {
                    const remaining = [];
                    (emojiImgGroups[g]||[]).forEach(x => {
                        if (emImgSelected.has(x.id) && g !== tg) {
                            if (!emojiImgGroups[tg].some(y => y.url === x.url)) { emojiImgGroups[tg].push(x); moved++; }
                        } else remaining.push(x);
                    });
                    emojiImgGroups[g] = remaining;
                }
                emImgSelected.clear(); saveAppearance(); renderEmImgs(); showToast(`移动 ${moved} 张到「${tg}」`);
            });
            if (clearEmImgBtn) clearEmImgBtn.addEventListener('click', () => {
                if (!emImgAll().length) return;
                if (!confirm('清空所有 emoji 图片？（不可恢复）')) return;
                for (const g of emojiImgGroupList) emojiImgGroups[g] = [];
                emImgSelected.clear(); saveAppearance(); renderEmImgs(); showToast('已清空');
            });
            if (emImgSearchInput) emImgSearchInput.addEventListener('input', renderEmImgs);
            // 表情弹窗默认选中颜文字tab
            const firstTab = document.querySelector('[data-sticker-tab="kaomoji"]');
            if (firstTab) firstTab.classList.add('active');
            // 初次渲染
            renderKaos(); renderEmSymGroups(); renderEmSyms(); renderEmImgs();

            // ========== 信封板块 ==========
            const envelopeModal = document.getElementById('envelopeModal');
            const closeEnvelopeModal = document.getElementById('closeEnvelopeModal');
            const envList = document.getElementById('envList');
            const envInboxCount = document.getElementById('envInboxCount');
            const envOutboxCount = document.getElementById('envOutboxCount');
            const envInnerTabs = document.getElementById('envInnerTabs');
            const envReplyArea = document.getElementById('envReplyArea');
            const envReplyInput = document.getElementById('envReplyInput');
            const envReplySendBtn = document.getElementById('envReplySendBtn');
            const envReplyCancelBtn = document.getElementById('envReplyCancelBtn');
            const envReplyHint = document.getElementById('envReplyHint');
            const envNewLetterArea = document.getElementById('envNewLetterArea');
            const envNewBtn = document.getElementById('envNewBtn');

            const envLetterModal = document.getElementById('envLetterModal');
            const closeLetterModal = document.getElementById('closeLetterModal');
            const envLetterTitleInput = document.getElementById('envLetterTitleInput');
            const envLetterContentInput = document.getElementById('envLetterContentInput');
            const envLetterSendBtn = document.getElementById('envLetterSendBtn');
            const envLetterCancelBtn = document.getElementById('envLetterCancelBtn');
            const envLetterTitle = document.getElementById('envLetterTitle');

            const sideEnvelopeBtn = document.getElementById('sideEnvelopeBtn');
            let envState = { box: 'mine', inner: 'inbox', replyingToId: null, writingFrom: null };

            // 梦角自发写时空信箱的信
            function angleAutoSpaceLetterRandom() {
                if (Math.random() > 0.06) return;  // 6%
                if (!cardLibrary.length) return;
                const _pid = genPairId();
                const letter = makeLetter({
                    from: 'space', to: 'usr', title: '',
                    content: cardLibrary[Math.floor(Math.random()*cardLibrary.length)],
                    sourceBox: 'space', parentId: null, pairId: _pid
                });
                letterBox.space.inbox.unshift(letter);
                // 同步出现在"我的信箱"收件箱（时空来信）—— 与时空原件共享 pairId，便于已读联动
                const mirror = {...letter, id: letter.id + '-m', mirrorOf: letter.id, sourceBox: 'mine', pairId: _pid};
                letterBox.mine.inbox.unshift(mirror);
                saveAppearance();
                showToast(`${angleName} 给你发了一封时空来信 ✉`);
                if (envelopeModal && envelopeModal.classList.contains('active')) renderEnvList();
            }

            function makeLetter({from,to,title,content,sourceBox,parentId,replyTargetId,sourceLetterBox,pairId}) {
                return {
                    id: 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
                    parentId: parentId || null,
                    replyTargetId: replyTargetId || null,
                    sourceLetterBox: sourceLetterBox || null,
                    // pairId：把"同一封信在不同信箱中的镜像/收发对"绑定在一起，便于已读状态同步
                    pairId: pairId || null,
                    title: title || '',
                    content: content || '',
                    from, to,
                    ts: Date.now(),
                    read: false,
                    replied: false,
                    sourceBox
                };
            }
            function genPairId() {
                return 'P' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
            }
            function getBox(box, inner) {
                if (box === 'space') return letterBox.space.inbox;
                return letterBox[box]?.[inner] || [];
            }
            function findLetter(letterId) {
                for (const bk of ['mine','angle','space']) {
                    const pools = bk === 'space' ? ['inbox'] : ['inbox','outbox'];
                    for (const ik of pools) {
                        const arr = letterBox[bk]?.[ik] || [];
                        const f = arr.find(x => x.id === letterId);
                        if (f) return {letter:f, bk, ik, arr};
                    }
                }
                return null;
            }
            // 找到"本质上同一封信"的全部副本（时空镜像 / 收发对），用于已读状态联动
            function findLetterPeers(letter) {
                const peers = [];
                if (!letter) return peers;
                // ① 时空镜像：本封是镜像（mirrorOf 指向时空原件）
                if (letter.mirrorOf) {
                    const orig = (letterBox.space.inbox||[]).find(x => x.id === letter.mirrorOf);
                    if (orig && orig !== letter) peers.push(orig);
                }
                // ① 反向：本封是时空原件 → 找 mine.inbox 里的镜像
                if (letter.sourceBox === 'space' || letter.from === 'space') {
                    (letterBox.mine.inbox||[]).forEach(m => { if (m.mirrorOf === letter.id && m !== letter) peers.push(m); });
                }
                // ②③ 收发对：靠 pairId 绑定 outbox↔inbox 的同一封信
                if (letter.pairId) {
                    for (const bk of ['mine','angle']) {
                        for (const ik of ['inbox','outbox']) {
                            (letterBox[bk]?.[ik]||[]).forEach(x => {
                                if (x !== letter && x.pairId === letter.pairId) peers.push(x);
                            });
                        }
                    }
                    // 时空信箱 inbox 也参与 pairId 联动
                    (letterBox.space.inbox||[]).forEach(x => {
                        if (x !== letter && x.pairId === letter.pairId) peers.push(x);
                    });
                }
                return peers;
            }
            // 把一封信（及其所有镜像/收发对副本）标记为已读
            function markLetterRead(letter) {
                if (!letter) return;
                let changed = false;
                if (!letter.read) { letter.read = true; changed = true; }
                findLetterPeers(letter).forEach(p => { if (!p.read) { p.read = true; changed = true; } });
                return changed;
            }

            function renderEnvList() {
                if (!envList) return;
                // 隐藏或显示 inner tabs（空间信箱只显示收件箱）
                if (envInnerTabs) {
                    const showBoth = envState.box !== 'space';
                    envInnerTabs.style.display = showBoth ? 'flex' : 'none';
                }
                // inner tabs 显示或隐藏"回信箱"tab
                const outBtn = document.querySelector('[data-env-inner="outbox"]');
                if (outBtn) outBtn.style.display = envState.box === 'space' ? 'none' : '';

                const inboxBtn = document.querySelector('[data-env-inner="inbox"]');
                if (inboxBtn) {
                    const cnt = getBox(envState.box, 'inbox').length;
                    if (envInboxCount) envInboxCount.textContent = cnt;
                }
                if (outBtn) {
                    const cnt = getBox(envState.box, 'outbox').length;
                    if (envOutboxCount) envOutboxCount.textContent = cnt;
                }
                // 回信/新建按钮区域
                envReplyArea.style.display = 'none';
                envNewLetterArea.style.display = envState.inner === 'outbox' ? 'flex' : 'none';

                const arr = getBox(envState.box, envState.inner).slice().sort((a,b)=>b.ts-a.ts);
                envList.innerHTML = '';
                if (!arr.length) { envList.innerHTML = '<div class="lib-empty">还没有信件哦~</div>'; return; }
                arr.forEach(letter => {
                    const d = document.createElement('div');
                    const cls = envState.box === 'space' ? 'space' : (envState.box === 'mine' ? 'mine' : 'angle');
                    const unread = !letter.read ? ' unread' : '';
                    d.className = `env-letter ${cls}${unread}`;
                    const title = letter.title || (letter.content.slice(0, 20) + (letter.content.length>20?'…':''));
                    const preview = letter.content.slice(0, 80) + (letter.content.length>80?'…':'');
                    const senderLabel = letter.from === 'usr' ? userName : (letter.from === 'angle' ? angleName : `${angleName}(时空)`);
                    const toLabel = letter.to === 'usr' ? userName : angleName;
                    const tags = [];
                    tags.push(letter.read ? `<span class="env-tag read">已读</span>` : `<span class="env-tag unread">未读</span>`);
                    if (letter.replied) tags.push(`<span class="env-tag replied">已回信</span>`);
                    if (letter.parentId) tags.push(`<span class="env-tag self">回复</span>`);
                    if (letter.sourceBox === 'space' || letter.from === 'space') tags.push(`<span class="env-tag">🌌 时空</span>`);

                    d.innerHTML = `
                        <div class="env-actions">
                            <button class="env-action-btn env-delete-btn" title="删除">✕</button>
                        </div>
                        <div class="env-head">
                            <span class="env-sender">${envState.inner==='inbox' ? '📥 来自 ' + senderLabel : '📤 写给 ' + toLabel}</span>
                            <span class="env-time">${formatDateCN(letter.ts)} ${formatTimeHMS(letter.ts)}</span>
                        </div>
                        <div class="env-title"></div>
                        <div class="env-preview"></div>
                        <div class="env-tags">${tags.join('')}</div>
                    `;
                    d.querySelector('.env-title').textContent = title;
                    d.querySelector('.env-preview').textContent = preview;

                    // 删除
                    d.querySelector('.env-delete-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!confirm('确定删除这封信？')) return;
                        const pool = getBox(envState.box, envState.inner);
                        const idx = pool.findIndex(x => x.id === letter.id);
                        if (idx >= 0) pool.splice(idx, 1);
                        saveAppearance(); renderEnvList();
                    });

                    // 点击卡片 = 展开详情 + 标记已读（按 box 类型区分：梦角收件箱不自动已读）
                    d.addEventListener('click', (e) => {
                        if (e.target.closest('.env-jump,.env-quote,.env-delete-btn,.env-reply-btn,.env-angle-read-btn')) return;
                        toggleLetterDetail(d, letter);
                        // 梦女在我的收信箱/时空信箱收信箱点查看 = 已读，
                        // 同时联动"本质上同一封信"的其它副本（时空原件/镜像、回信收发对）一并已读
                        const box = envState.box;
                        if ((box === 'mine' || box === 'space') && envState.inner === 'inbox') {
                            if (markLetterRead(letter)) { saveAppearance(); renderEnvList(); }
                        }
                    });
                    envList.appendChild(d);
                });
            }

            function toggleLetterDetail(cardEl, letter) {
                // 先移除其他详情
                const others = envList.querySelectorAll('.env-detail, .env-quote, .env-jump, .env-reply-btn');
                others.forEach(o => o.remove());
                envList.querySelectorAll('.env-detail-open').forEach(c => c.classList.remove('env-detail-open'));
                if (cardEl.classList.contains('env-detail-open')) { cardEl.classList.remove('env-detail-open'); return; }
                cardEl.classList.add('env-detail-open');
                // 详情
                const det = document.createElement('div');
                det.className = 'env-detail';
                det.textContent = letter.content;
                cardEl.appendChild(det);
                // 引用（回信原信 / 被回信的原信）
                if (letter.replyTargetId || letter.parentId) {
                    const targetId = letter.replyTargetId || letter.parentId;
                    const f = findLetter(targetId);
                    if (f) {
                        const q = document.createElement('div');
                        q.className = 'env-quote';
                        const qTitle = f.letter.title || (f.letter.content.slice(0,20)+'…');
                        q.innerHTML = `<div class="env-quote-label">↪ ${f.bk==='mine'?'我':(f.bk==='angle'?angleName:'时空')}的${f.ik==='inbox'?'原信':'回信'}</div><div></div>`;
                        q.querySelector('div:nth-child(2)').textContent = qTitle + ' — ' + (f.letter.content.slice(0, 50) + (f.letter.content.length>50?'…':''));
                        q.addEventListener('click', () => jumpToLetterInBox(targetId));
                        cardEl.appendChild(q);
                    }
                }
                // 跳转按钮
                const jumpWrap = document.createElement('div');
                jumpWrap.className = 'env-jump';
                // 梦角收信箱：提供"梦角已读"按钮（梦女点查看不算梦角已读，需梦角本人读信）
                // 标记后联动同一封信在"我的回信箱"等其它信箱里的副本一并已读
                if (envState.box === 'angle' && envState.inner === 'inbox') {
                    const arb = document.createElement('button');
                    arb.className = 'env-angle-read-btn';
                    arb.textContent = letter.read ? '✓ 梦角已读' : '👁 标记梦角已读';
                    arb.addEventListener('click', () => {
                        if (markLetterRead(letter)) { saveAppearance(); renderEnvList(); showToast('梦角已读 ✉'); }
                    });
                    jumpWrap.appendChild(arb);
                }
                // 收件箱可点"回信"
                if (envState.inner === 'inbox') {
                    const rb = document.createElement('button');
                    rb.textContent = '✍ 给 ta 回信';
                    rb.className = 'env-reply-btn';
                    rb.addEventListener('click', () => startReply(letter));
                    jumpWrap.appendChild(rb);
                }
                // 跳转回原信（如果本封是回信）
                if (letter.replyTargetId || letter.parentId) {
                    const jb = document.createElement('button');
                    jb.textContent = '↩ 跳转到原信';
                    jb.addEventListener('click', () => jumpToLetterInBox(letter.replyTargetId || letter.parentId));
                    jumpWrap.appendChild(jb);
                }
                cardEl.appendChild(jumpWrap);
            }

            function jumpToLetterInBox(targetId) {
                const f = findLetter(targetId);
                if (!f) { showToast('原信已被删除，无法跳转'); return; }
                envState.box = f.bk;
                if (f.bk !== 'space') envState.inner = f.ik;
                // 同步 tabs 高亮
                document.querySelectorAll('[data-env-box]').forEach(b => b.classList.toggle('active', b.dataset.envBox === f.bk));
                document.querySelectorAll('[data-env-inner]').forEach(b => {
                    if (f.bk === 'space' && b.dataset.envInner !== 'inbox') return;
                    b.classList.toggle('active', b.dataset.envInner === f.ik);
                });
                renderEnvList();
                setTimeout(() => {
                    const cards = envList.querySelectorAll('.env-letter');
                    let target = null;
                    cards.forEach(c => {
                        const t = c.querySelector('.env-title')?.textContent || '';
                        const p = c.querySelector('.env-preview')?.textContent || '';
                        const full = f.letter.title || f.letter.content.slice(0,20)+'…';
                        const prev = f.letter.content.slice(0,80)+(f.letter.content.length>80?'…':'');
                        if (t === full && p === prev) target = c;
                    });
                    if (target) { target.scrollIntoView({behavior:'smooth', block:'center'}); toggleLetterDetail(target, f.letter); }
                }, 100);
            }

            // 点收信箱某信 = 进入回信模式
            function startReply(letter) {
                // 回信改走大信纸 Modal（envLetterModal），让用户在大信纸上撰写回信 + 折叠对照原信
                envWritingLetterState = 'reply';
                envState.replyingToId = letter.id;
                envLetterTitle.textContent = '✍ 回信给 ' + (letter.from === 'usr' ? userName : angleName);
                // 折叠窗注入梦角原信内容
                var fold = document.getElementById('envReplyFold');
                if (fold) {
                    fold.style.display = '';
                    fold.open = false; // 默认折叠
                }
                var rq = document.getElementById('envRqSender');  if (rq) rq.textContent = (letter.from === 'usr' ? userName : angleName);
                var rt = document.getElementById('envRqTime');    if (rt) rt.textContent = formatDateCN(letter.ts) + ' ' + formatTimeHMS(letter.ts);
                var rtt = document.getElementById('envRqTitle');  if (rtt) rtt.textContent = letter.title || '(无标题)';
                var rc = document.getElementById('envRqContent'); if (rc) rc.textContent = letter.content;
                // 预填回信标题 & 正文（可选预填）
                envLetterTitleInput.value = 'Re：' + (letter.title || '梦角来信');
                envLetterContentInput.value = '';
                openModal(envLetterModal);
                setTimeout(() => envLetterContentInput.focus(), 80);
            }

            // 发送回信：我的信箱.outbox（回信） → 他的信箱.inbox（收信）；反之对称
            // 时空信箱的回信：也全部进入他的信箱.inbox（梦角收件），互不干扰
            function sendReply() {
                const content = (envReplyInput?.value||'').trim();
                const title = '';
                if (!content) { showToast('请写点内容'); return; }
                const target = findLetter(envState.replyingToId);
                if (!target) { showToast('无法定位原信'); return; }
                const origin = target.letter;
                // 回信者：根据当前所在大板块判断是谁在发信
                const me = envState.box === 'mine' ? 'usr' : 'angle';
                const peer = me === 'usr' ? 'angle' : 'usr';
                const meBox = envState.box;  // 'mine' or 'angle'
                const peerBox = meBox === 'mine' ? 'angle' : 'mine';
                // 回信的 out/in 对共享同一个 pairId，便于已读联动
                const _rpid = genPairId();
                // 我的回信进入"当前大板块.outbox"
                const outLetter = makeLetter({
                    from: me, to: peer, title, content,
                    sourceBox: meBox,
                    parentId: origin.id, replyTargetId: origin.id,
                    sourceLetterBox: target.bk, pairId: _rpid
                });
                letterBox[meBox].outbox.unshift(outLetter);
                // 对方收信箱增加一封收信（引用同内容，新id）
                const inLetter = makeLetter({
                    from: me, to: peer, title, content,
                    sourceBox: peerBox,
                    parentId: origin.id, replyTargetId: origin.id,
                    sourceLetterBox: target.bk, pairId: _rpid
                });
                inLetter.id = 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2,4);
                letterBox[peerBox].inbox.unshift(inLetter);
                // 原信标为已回信
                origin.replied = true;
                // 如对方收信箱有对应的 mirror 或同一id（时空），也标记
                saveAppearance();
                envReplyArea.style.display = 'none';
                envReplyInput.value = '';
                envState.replyingToId = null;
                showToast(`回信已送达${peerBox==='mine'?'我的':'他的'}收信箱 ✉`);
                renderEnvList();
            }

            // 新建一封信（在回信箱里点"新建"= 非回复，直接写给对方）
            let envWritingLetterState = 'new';  // 'new' or 'reply'
            function openNewLetter(writeAs) {
                envWritingLetterState = 'new';
                envLetterTitle.textContent = writeAs === 'usr' ? '✍ 我给梦角写一封信' : '✍ 梦角给我写一封信';
                envState.writingFrom = writeAs;
                envLetterTitleInput.value = '';
                envLetterContentInput.value = '';
                // 新建模式隐藏原信折叠窗
                var fold = document.getElementById('envReplyFold');
                if (fold) fold.style.display = 'none';
                openModal(envLetterModal);
                setTimeout(() => envLetterTitleInput.focus(), 50);
            }
            function closeNewLetter() {
                // 关闭时把折叠窗 reset
                var fold = document.getElementById('envReplyFold');
                if (fold) { fold.style.display = 'none'; fold.open = false; }
                envWritingLetterState = 'new';
                envState.replyingToId = null;
                closeModal(envLetterModal);
            }
            function sendNewLetter() {
                const content = (envLetterContentInput?.value||'').trim();
                const title = (envLetterTitleInput?.value||'').trim();
                if (!content) { showToast('信的内容不能为空'); return; }
                // 回信模式 —— 调 sendReply 原有逻辑
                if (envWritingLetterState === 'reply' && envState.replyingToId) {
                    var origin = findLetter(envState.replyingToId);
                    if (!origin) { showToast('原信已丢失'); closeNewLetter(); return; }
                    var _nrid = genPairId();
                    var letter = makeLetter({
                        from: envState.box === 'mine' ? 'usr' : 'angle',
                        to: envState.box === 'mine' ? 'angle' : 'usr',
                        title: title, content: content,
                        sourceBox: envState.box === 'mine' ? 'mine' : 'angle',
                        parentId: origin.letter.id,
                        replyTargetId: origin.letter.id,
                        replied: true, pairId: _nrid
                    });
                    // 进入双方 outbox/inbox（时空信 不受影响，只进正常收发）
                    var rMe = letter.from, rPeer = letter.to;
                    var rMeBox = rMe === 'usr' ? 'mine' : 'angle';
                    var rPeerBox = rMe === 'usr' ? 'angle' : 'mine';
                    letterBox[rMeBox].outbox.unshift(letter);
                    var inc2 = makeLetter({ from: rMe, to: rPeer, title, content, sourceBox: rPeerBox, parentId: origin.letter.id, replyTargetId: origin.letter.id, replied: true, pairId: _nrid });
                    letterBox[rPeerBox].inbox.unshift(inc2);
                    // 原信标记已被回信
                    var originLetter = origin.letter;
                    originLetter.replied = true;
                    saveAppearance(); closeNewLetter();
                    showToast('回信已寄出 ✉'); renderEnvList();
                    return;
                }
                // 新建模式
                const me = envState.writingFrom || (envState.box === 'mine' ? 'usr' : 'angle');
                const peer = me === 'usr' ? 'angle' : 'usr';
                const meBox = me === 'usr' ? 'mine' : 'angle';
                const peerBox = me === 'usr' ? 'angle' : 'mine';
                const _npid = genPairId();
                const out = makeLetter({ from:me, to:peer, title, content, sourceBox:meBox, parentId:null, replyTargetId:null, pairId: _npid });
                letterBox[meBox].outbox.unshift(out);
                const inc = makeLetter({ from:me, to:peer, title, content, sourceBox:peerBox, parentId:null, replyTargetId:null, pairId: _npid });
                inc.id = 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2,4);
                letterBox[peerBox].inbox.unshift(inc);
                saveAppearance(); closeNewLetter();
                showToast('信件已寄出 ✉');
                renderEnvList();
            }
            if (envReplySendBtn) envReplySendBtn.addEventListener('click', sendReply);
            if (envReplyInput) envReplyInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey||e.metaKey)) { e.preventDefault(); sendReply(); }
            });
            if (envReplyCancelBtn) envReplyCancelBtn.addEventListener('click', () => {
                envReplyArea.style.display = 'none';
                envReplyInput.value = '';
                envState.replyingToId = null;
            });
            if (envNewBtn) envNewBtn.addEventListener('click', () => {
                const writeAs = envState.box === 'mine' ? 'usr' : (envState.box === 'angle' ? 'angle' : 'usr');
                openNewLetter(writeAs);
            });
            if (closeLetterModal) closeLetterModal.addEventListener('click', closeNewLetter);
            if (envLetterCancelBtn) envLetterCancelBtn.addEventListener('click', closeNewLetter);
            if (envLetterSendBtn) envLetterSendBtn.addEventListener('click', sendNewLetter);
            if (envLetterContentInput) envLetterContentInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey||e.metaKey)) { e.preventDefault(); sendNewLetter(); }
            });

            // tabs 绑定
            document.querySelectorAll('[data-env-box]').forEach(b => b.addEventListener('click', () => {
                document.querySelectorAll('[data-env-box]').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                envState.box = b.dataset.envBox;
                if (envState.box === 'space') envState.inner = 'inbox';
                document.querySelectorAll('[data-env-inner]').forEach(ib => {
                    ib.classList.toggle('active', ib.dataset.envInner === envState.inner);
                });
                renderEnvList();
            }));
            document.querySelectorAll('[data-env-inner]').forEach(b => b.addEventListener('click', () => {
                document.querySelectorAll('[data-env-inner]').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                envState.inner = b.dataset.envInner;
                renderEnvList();
            }));
            if (closeEnvelopeModal) closeEnvelopeModal.addEventListener('click', () => closeModal(envelopeModal));
            if (envelopeModal) envelopeModal.addEventListener('click', (e) => { if (e.target === envelopeModal) closeModal(envelopeModal); });
            if (envLetterModal) envLetterModal.addEventListener('click', (e) => { if (e.target === envLetterModal) closeModal(envLetterModal); });
            if (sideEnvelopeBtn) sideEnvelopeBtn.addEventListener('click', () => {
                closeSidePanel();
                envState = { box: 'mine', inner: 'inbox', replyingToId: null, writingFrom: null };
                document.querySelectorAll('[data-env-box]').forEach(b => b.classList.toggle('active', b.dataset.envBox === 'mine'));
                document.querySelectorAll('[data-env-inner]').forEach(b => b.classList.toggle('active', b.dataset.envInner === 'inbox'));
                renderEnvList();
                openModal(envelopeModal);
            });

            // ========== 留言板 + 许愿树 ==========
            const boardModal = document.getElementById('boardModal');
            const closeBoardModal = document.getElementById('closeBoardModal');
            const boardGrid = document.getElementById('boardGrid');
            const boardRefreshBtn = document.getElementById('boardRefreshBtn');
            const boardPhraseBtn = document.getElementById('boardPhraseBtn');
            const boardHistBtn = document.getElementById('boardHistBtn');
            const boardPhraseModal = document.getElementById('boardPhraseModal');
            const closeBoardPhraseModal = document.getElementById('closeBoardPhraseModal');
            const boardPhraseList = document.getElementById('boardPhraseList');
            const boardPhraseInput = document.getElementById('boardPhraseInput');
            const boardPhraseAddBtn = document.getElementById('boardPhraseAddBtn');
            const boardHistModal = document.getElementById('boardHistModal');
            const closeBoardHistModal = document.getElementById('closeBoardHistModal');
            const boardHistList = document.getElementById('boardHistList');

            const wishModal = document.getElementById('wishModal');
            const closeWishModal = document.getElementById('closeWishModal');
            const wishGrid = document.getElementById('wishGrid');
            const wishRefreshBtn = document.getElementById('wishRefreshBtn');
            const wishPhraseBtn = document.getElementById('wishPhraseBtn');
            const wishHistBtn = document.getElementById('wishHistBtn');
            const wishPhraseModal = document.getElementById('wishPhraseModal');
            const closeWishPhraseModal = document.getElementById('closeWishPhraseModal');
            const wishPhraseList = document.getElementById('wishPhraseList');
            const wishPhraseInput = document.getElementById('wishPhraseInput');
            const wishPhraseAddBtn = document.getElementById('wishPhraseAddBtn');
            const wishHistModal = document.getElementById('wishHistModal');
            const closeWishHistModal = document.getElementById('closeWishHistModal');
            const wishHistList = document.getElementById('wishHistList');

            // 本地时间 → datetime-local 字符串 YYYY-MM-DDTHH:MM
            function toLocalDTInput(ts) {
                const d = new Date(ts || Date.now());
                const p = n => String(n).padStart(2,'0');
                return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());
            }
            // 从 datetime-local 字符串取时间戳
            function fromLocalDTInput(s) {
                const t = new Date(s).getTime();
                return isNaN(t) ? Date.now() : t;
            }

            // ---- 留言板 ----
            function boardPickAngleContent() {
                // 55% 概率从内置/自定义话语库抽；否则混入字卡/emoji/颜文字
                const phrases = messageBoard.phrases || [];
                if (phrases.length && Math.random() < 0.55) return phrases[Math.floor(Math.random()*phrases.length)];
                const pool = [];
                try { if (cardLibrary && cardLibrary.length) pool.push.apply(pool, cardLibrary); } catch(e){}
                try { var f=[]; for (var g in emojiGroups) f.push.apply(f,(emojiGroups[g]||[])); if (f.length) pool.push.apply(pool,f); } catch(e){}
                try { var k=[]; for (var g2 in kaomojiGroups) k.push.apply(k,(kaomojiGroups[g2]||[])); if (k.length) pool.push.apply(pool,k); } catch(e){}
                if (phrases.length) pool.push.apply(pool, phrases);
                if (!pool.length) return '今天也想和你说说话。';
                return pool[Math.floor(Math.random()*pool.length)];
            }
            function boardRolloverDay() {
                const today = formatDateKey(Date.now());
                if (messageBoard.lastDate && messageBoard.lastDate !== today) {
                    if (messageBoard.notes && messageBoard.notes.length) {
                        messageBoard.history[messageBoard.lastDate] = JSON.parse(JSON.stringify(messageBoard.notes));
                    }
                    messageBoard.notes = [];
                    messageBoard.lastDate = today;
                    saveAppearance();
                } else if (!messageBoard.lastDate) {
                    messageBoard.lastDate = today;
                    saveAppearance();
                }
            }
            function boardFillToday(n) {
                boardRolloverDay();
                let added = 0;
                while (messageBoard.notes.length < 5 && added < n) {
                    messageBoard.notes.push({
                        id: 'BN' + Date.now().toString(36) + Math.floor(Math.random()*10000),
                        content: boardPickAngleContent(),
                        ts: Date.now(),
                        date: formatDateKey(Date.now()),
                        read: false,
                        replies: []
                    });
                    added++;
                }
                saveAppearance();
            }
            function renderBoard() {
                if (!boardGrid) return;
                boardGrid.innerHTML = '';
                boardRolloverDay();
                const empty = document.getElementById('boardEmpty');
                if (!messageBoard.notes.length) { if (empty) empty.style.display=''; return; }
                if (empty) empty.style.display='none';
                messageBoard.notes.forEach(note => {
                    const d = document.createElement('div');
                    d.className = 'board-note' + (note.read ? '' : ' unread');
                    d.innerHTML = '<div class="bn-fold">💌</div>'
                        + '<div class="bn-tip">点击查看留言</div>'
                        + '<div class="bn-rep">' + (note.replies.length ? '↪ '+note.replies.length : '') + '</div>'
                        + '<div class="bn-time">' + formatTimeHMS(note.ts) + '</div>';
                    d.addEventListener('click', () => {
                        let changed = false;
                        if (!note.read) { note.read = true; changed = true; d.classList.remove('unread'); }
                        if (changed) saveAppearance();
                        try { toggleBoardDetail(d, note); } catch(err){ console.error('boardDetail', err); }
                    });
                    boardGrid.appendChild(d);
                });
            }
            function toggleBoardDetail(cardEl, note) {
                const others = boardGrid.querySelectorAll('.board-detail');
                others.forEach(o => o.remove());
                boardGrid.querySelectorAll('.board-note').forEach(c => { c.dataset.open=''; });
                if (cardEl.dataset.open === '1') { cardEl.dataset.open=''; return; }
                cardEl.dataset.open = '1';
                const det = document.createElement('div');
                det.className = 'board-detail';
                let reps = '';
                (note.replies||[]).forEach(r => {
                    reps += '<div class="bd-reply"><div class="br-time">'+formatDateCN(r.ts)+' '+formatTimeHMS(r.ts)+'</div><div class="br-content"></div></div>';
                });
                det.innerHTML = '<div class="bd-head"><span>来自 <b>'+angleName+'</b></span><span>'+formatDateCN(note.ts)+' '+formatTimeHMS(note.ts)+'</span></div>'
                    + '<div class="bd-content"></div>'
                    + (reps ? '<div class="bd-replies">'+reps+'</div>' : '')
                    + '<div class="bd-reply-area">'
                    + '<textarea class="mod-textarea" placeholder="写下你的回复..."></textarea>'
                    + '<div class="bd-reply-row">'
                    + '<label class="bd-send-chat"><input type="checkbox" class="bd-chat-cb" /> 同时发送到聊天界面</label>'
                    + '</div>'
                    + '<div class="bd-reply-row">'
                    + '<button class="btn btn-primary-mod" data-act="now">💬 立即回复</button>'
                    + '<input type="datetime-local" />'
                    + '<button class="btn" data-act="custom">⏰ 定时回复</button>'
                    + '</div></div>';
                det.querySelector('.bd-content').textContent = note.content;
                // 回填已渲染回复内容（防 XSS）
                det.querySelectorAll('.bd-reply').forEach((node, i) => { node.querySelector('.br-content').textContent = note.replies[i].content; });
                const ta = det.querySelector('textarea');
                const dt = det.querySelector('input[type="datetime-local"]');
                const cb = det.querySelector('.bd-chat-cb');
                dt.value = toLocalDTInput(Date.now());
                // 将回复发送到聊天界面（含梦角自动回复）
                function sendReplyToChat(content, replyTs) {
                    if (!content) return;
                    // 先关闭留言板/许愿树弹窗，切到聊天
                    try { closeModal(boardModal); } catch(e){}
                    try { closeModal(wishModal); } catch(e){}
                    const now = Date.now();
                    const delta = replyTs ? Math.max(0, replyTs - now) : 0;
                    function doSend() {
                        addChatMessage(content, 'user');
                        if (chatSoundMsg) try { playSfx('send'); } catch(e){}
                        // 触发梦角回复
                        if (!(chatReadNoReply && Math.random() < 0.45)) {
                            const minD = Math.max(100, Math.floor(Math.min(replyDelayMin || 0, replyDelayMax || 0)));
                            const maxD = Math.max(minD + 200, Math.floor(Math.max(replyDelayMin || 0, replyDelayMax || 0)));
                            const baseSpeed = isNaN(chatReplySpeed) ? 0 : Math.max(0, Math.floor(chatReplySpeed));
                            const delay = baseSpeed + minD + Math.floor(Math.random() * Math.max(1, (maxD - minD)));
                            if (replyTimer) { clearTimeout(replyTimer); replyTimer = null; }
                            try { showTyping(); } catch(e){}
                            replyTimer = setTimeout(() => { try { replyWithRandomCard(); } catch(e){} }, delay);
                        }
                    }
                    if (delta <= 0) doSend();
                    // 定时回复若时间差 ≤ 24h 则安排发送；超过则仅保留在留言板/许愿树内
                    else if (delta <= 24 * 3600 * 1000) setTimeout(doSend, delta);
                }
                det.querySelector('[data-act="now"]').addEventListener('click', () => {
                    const c = (ta.value||'').trim();
                    if (!c) { showToast('写点什么再回复吧'); return; }
                    const now = Date.now();
                    note.replies.push({ id:'BR'+now, content:c, ts:now, from:'usr' });
                    saveAppearance(); renderBoard(); showToast('回复已留下 ✿');
                    if (cb && cb.checked) sendReplyToChat(c, now);
                });
                det.querySelector('[data-act="custom"]').addEventListener('click', () => {
                    const c = (ta.value||'').trim();
                    if (!c) { showToast('写点什么再回复吧'); return; }
                    const customTs = fromLocalDTInput(dt.value);
                    note.replies.push({ id:'BR'+Date.now(), content:c, ts:customTs, from:'usr' });
                    saveAppearance(); renderBoard(); showToast('定时回复已留下 ✿');
                    if (cb && cb.checked) sendReplyToChat(c, customTs);
                });
                cardEl.after(det);
            }
            function renderBoardPhrases() {
                if (!boardPhraseList) return;
                boardPhraseList.innerHTML = '';
                const list = messageBoard.phrases || [];
                if (!list.length) { boardPhraseList.innerHTML = '<div class="lib-empty">还没有自定义话语</div>'; return; }
                list.forEach((p, i) => {
                    const it = document.createElement('div');
                    it.className = 'phrase-item';
                    const sp = document.createElement('span'); sp.textContent = p; it.appendChild(sp);
                    const b = document.createElement('button'); b.textContent='删除';
                    b.addEventListener('click', () => { messageBoard.phrases.splice(i,1); saveAppearance(); renderBoardPhrases(); });
                    it.appendChild(b);
                    boardPhraseList.appendChild(it);
                });
            }
            function renderBoardHistory() {
                if (!boardHistList) return;
                boardHistList.innerHTML = '';
                const days = Object.keys(messageBoard.history||{}).sort((a,b)=> b.localeCompare(a));
                if (!days.length) { boardHistList.innerHTML = '<div class="lib-empty">还没有历史留言</div>'; return; }
                days.forEach(day => {
                    const dh = document.createElement('div'); dh.className='hist-day'; dh.textContent = day; boardHistList.appendChild(dh);
                    (messageBoard.history[day]||[]).forEach(note => {
                        const it = document.createElement('div'); it.className='hist-item';
                        let reps = '';
                        (note.replies||[]).forEach(r => { reps += '<div class="hi-r"><b>'+userName+'</b> · '+formatDateCN(r.ts)+' '+formatTimeHMS(r.ts)+'：<span></span></div>'; });
                        it.innerHTML = '<div class="hi-head" style="font-size:0.6rem;color:var(--text-muted);margin-bottom:4px;">'+angleName+' · '+formatTimeHMS(note.ts)+'</div><div class="hi-c"></div>'+reps;
                        it.querySelector('.hi-c').textContent = note.content;
                        const spans = it.querySelectorAll('.hi-r span');
                        (note.replies||[]).forEach((r, idx) => { if (spans[idx]) spans[idx].textContent = r.content; });
                        boardHistList.appendChild(it);
                    });
                });
            }

            // ---- 许愿树 ----
            function wishPickContent(color) {
                const pool = (wishTree.phrases[color] || []).slice();
                if (!pool.length) return '想和你说说话。';
                return pool[Math.floor(Math.random()*pool.length)];
            }
            function wishRolloverDay() {
                const today = formatDateKey(Date.now());
                if (wishTree.lastDate && wishTree.lastDate !== today) {
                    if (wishTree.stars && wishTree.stars.length) {
                        wishTree.history[wishTree.lastDate] = JSON.parse(JSON.stringify(wishTree.stars));
                    }
                    wishTree.stars = [];
                    wishTree.lastDate = today;
                    saveAppearance();
                } else if (!wishTree.lastDate) {
                    wishTree.lastDate = today;
                    saveAppearance();
                }
            }
            function wishFillToday(n) {
                wishRolloverDay();
                const colors = ['yellow','pink','blue','red','green','purple'];
                let added = 0;
                while (wishTree.stars.length < 5 && added < n) {
                    const color = colors[Math.floor(Math.random()*colors.length)];
                    wishTree.stars.push({
                        id: 'WS' + Date.now().toString(36) + Math.floor(Math.random()*10000),
                        color: color,
                        content: wishPickContent(color),
                        ts: Date.now(),
                        date: formatDateKey(Date.now()),
                        read: false,
                        replies: []
                    });
                    added++;
                }
                saveAppearance();
            }
            function renderWish() {
                if (!wishGrid) return;
                wishGrid.innerHTML = '';
                wishRolloverDay();
                const empty = document.getElementById('wishEmpty');
                if (!wishTree.stars.length) { if (empty) empty.style.display=''; return; }
                if (empty) empty.style.display='none';
                wishTree.stars.forEach(star => {
                    const d = document.createElement('button');
                    d.className = 'star-item star-c-'+star.color + (star.read ? '' : ' unread');
                    d.innerHTML = '<span class="si-icon">'+WISH_COLORS[star.color].icon+'</span>'
                        + '<span class="si-tip">'+WISH_COLORS[star.color].label+'</span>'
                        + '<span class="si-time">'+formatTimeHMS(star.ts)+'</span>';
                    d.addEventListener('click', () => {
                        let changed = false;
                        if (!star.read) { star.read = true; changed = true; d.classList.remove('unread'); }
                        if (changed) saveAppearance();
                        try { toggleWishDetail(d, star); } catch(err){ console.error('wishDetail', err); }
                    });
                    wishGrid.appendChild(d);
                });
            }
            function toggleWishDetail(cardEl, star) {
                const others = wishGrid.querySelectorAll('.star-detail');
                others.forEach(o => o.remove());
                wishGrid.querySelectorAll('.star-item').forEach(c => { c.dataset.open=''; });
                if (cardEl.dataset.open === '1') { cardEl.dataset.open=''; return; }
                cardEl.dataset.open = '1';
                const det = document.createElement('div');
                det.className = 'star-detail board-detail';
                let reps = '';
                (star.replies||[]).forEach(r => {
                    reps += '<div class="bd-reply"><div class="br-time">'+formatDateCN(r.ts)+' '+formatTimeHMS(r.ts)+'</div><div class="br-content"></div></div>';
                });
                det.innerHTML = '<div class="bd-head"><span><b style="color:#a87ff0;">'+WISH_COLORS[star.color].icon+' '+WISH_COLORS[star.color].label+'</b></span><span>'+formatDateCN(star.ts)+' '+formatTimeHMS(star.ts)+'</span></div>'
                    + '<div class="bd-content"></div>'
                    + (reps ? '<div class="bd-replies">'+reps+'</div>' : '')
                    + '<div class="bd-reply-area">'
                    + '<textarea class="mod-textarea" placeholder="回应 ta 的愿望..."></textarea>'
                    + '<div class="bd-reply-row">'
                    + '<label class="bd-send-chat"><input type="checkbox" class="bd-chat-cb" /> 同时发送到聊天界面</label>'
                    + '</div>'
                    + '<div class="bd-reply-row">'
                    + '<button class="btn btn-primary-mod" data-act="now">💬 立即回应</button>'
                    + '<input type="datetime-local" />'
                    + '<button class="btn" data-act="custom">⏰ 定时回应</button>'
                    + '</div></div>';
                det.querySelector('.bd-content').textContent = star.content;
                det.querySelectorAll('.bd-reply').forEach((node, i) => { node.querySelector('.br-content').textContent = star.replies[i].content; });
                const ta = det.querySelector('textarea');
                const dt = det.querySelector('input[type="datetime-local"]');
                const cb = det.querySelector('.bd-chat-cb');
                dt.value = toLocalDTInput(Date.now());
                // 将回应发送到聊天界面（含梦角自动回复）- 复用留言板的 sendReplyToChat 思路
                function sendWishReplyToChat(content, replyTs) {
                    if (!content) return;
                    try { closeModal(boardModal); } catch(e){}
                    try { closeModal(wishModal); } catch(e){}
                    const now = Date.now();
                    const delta = replyTs ? Math.max(0, replyTs - now) : 0;
                    function doSend() {
                        addChatMessage(content, 'user');
                        if (chatSoundMsg) try { playSfx('send'); } catch(e){}
                        if (!(chatReadNoReply && Math.random() < 0.45)) {
                            const minD = Math.max(100, Math.floor(Math.min(replyDelayMin || 0, replyDelayMax || 0)));
                            const maxD = Math.max(minD + 200, Math.floor(Math.max(replyDelayMin || 0, replyDelayMax || 0)));
                            const baseSpeed = isNaN(chatReplySpeed) ? 0 : Math.max(0, Math.floor(chatReplySpeed));
                            const delay = baseSpeed + minD + Math.floor(Math.random() * Math.max(1, (maxD - minD)));
                            if (replyTimer) { clearTimeout(replyTimer); replyTimer = null; }
                            try { showTyping(); } catch(e){}
                            replyTimer = setTimeout(() => { try { replyWithRandomCard(); } catch(e){} }, delay);
                        }
                    }
                    if (delta <= 0) doSend();
                    else if (delta <= 24 * 3600 * 1000) setTimeout(doSend, delta);
                }
                det.querySelector('[data-act="now"]').addEventListener('click', () => {
                    const c = (ta.value||'').trim();
                    if (!c) { showToast('写点什么再回应吧'); return; }
                    const now = Date.now();
                    star.replies.push({ id:'WR'+now, content:c, ts:now, from:'usr' });
                    saveAppearance(); renderWish(); showToast('回应已留下 ✿');
                    if (cb && cb.checked) sendWishReplyToChat(c, now);
                });
                det.querySelector('[data-act="custom"]').addEventListener('click', () => {
                    const c = (ta.value||'').trim();
                    if (!c) { showToast('写点什么再回应吧'); return; }
                    const customTs = fromLocalDTInput(dt.value);
                    star.replies.push({ id:'WR'+Date.now(), content:c, ts:customTs, from:'usr' });
                    saveAppearance(); renderWish(); showToast('定时回应已留下 ✿');
                    if (cb && cb.checked) sendWishReplyToChat(c, customTs);
                });
                cardEl.after(det);
            }
            let wishCurColor = 'yellow';
            function renderWishPhrases() {
                if (!wishPhraseList) return;
                wishPhraseList.innerHTML = '';
                const list = wishTree.phrases[wishCurColor] || [];
                if (!list.length) { wishPhraseList.innerHTML = '<div class="lib-empty">还没有该颜色的愿望</div>'; return; }
                list.forEach((p, i) => {
                    const it = document.createElement('div');
                    it.className = 'phrase-item';
                    const sp = document.createElement('span'); sp.textContent = p; it.appendChild(sp);
                    const b = document.createElement('button'); b.textContent='删除';
                    b.addEventListener('click', () => { wishTree.phrases[wishCurColor].splice(i,1); saveAppearance(); renderWishPhrases(); });
                    it.appendChild(b);
                    wishPhraseList.appendChild(it);
                });
            }
            function renderWishHistory() {
                if (!wishHistList) return;
                wishHistList.innerHTML = '';
                const days = Object.keys(wishTree.history||{}).sort((a,b)=> b.localeCompare(a));
                if (!days.length) { wishHistList.innerHTML = '<div class="lib-empty">还没有历史愿望</div>'; return; }
                days.forEach(day => {
                    const dh = document.createElement('div'); dh.className='hist-day'; dh.textContent = day; wishHistList.appendChild(dh);
                    (wishTree.history[day]||[]).forEach(star => {
                        const it = document.createElement('div'); it.className='hist-item';
                        let reps = '';
                        (star.replies||[]).forEach(r => { reps += '<div class="hi-r"><b>'+userName+'</b> · '+formatDateCN(r.ts)+' '+formatTimeHMS(r.ts)+'：<span></span></div>'; });
                        it.innerHTML = '<div class="hi-head" style="font-size:0.6rem;color:var(--text-muted);margin-bottom:4px;">'+WISH_COLORS[star.color].icon+' '+WISH_COLORS[star.color].label+' · '+formatTimeHMS(star.ts)+'</div><div class="hi-c"></div>'+reps;
                        it.querySelector('.hi-c').textContent = star.content;
                        const spans = it.querySelectorAll('.hi-r span');
                        (star.replies||[]).forEach((r, idx) => { if (spans[idx]) spans[idx].textContent = r.content; });
                        wishHistList.appendChild(it);
                    });
                });
            }

            // 留言板 绑定
            if (sideBoardBtn) sideBoardBtn.addEventListener('click', () => { closeSidePanel(); renderBoard(); openModal(boardModal); });
            if (closeBoardModal) closeBoardModal.addEventListener('click', () => closeModal(boardModal));
            if (boardRefreshBtn) boardRefreshBtn.addEventListener('click', () => {
                boardRolloverDay();
                if (messageBoard.notes.length >= 5) { showToast('今天的留言已经满 5 条啦~'); return; }
                const need = 5 - messageBoard.notes.length;
                boardFillToday(need);
                renderBoard();
                showToast('梦角留下了 '+need+' 条留言 💌');
            });
            if (boardPhraseBtn) boardPhraseBtn.addEventListener('click', () => { renderBoardPhrases(); openModal(boardPhraseModal); });
            if (closeBoardPhraseModal) closeBoardPhraseModal.addEventListener('click', () => closeModal(boardPhraseModal));
            if (boardPhraseAddBtn) boardPhraseAddBtn.addEventListener('click', () => {
                const v = (boardPhraseInput.value||'').trim();
                if (!v) { showToast('写一句再添加'); return; }
                messageBoard.phrases.push(v); saveAppearance(); boardPhraseInput.value='';
                renderBoardPhrases(); showToast('已加入话语库 ✿');
            });
            if (boardHistBtn) boardHistBtn.addEventListener('click', () => { renderBoardHistory(); openModal(boardHistModal); });
            if (closeBoardHistModal) closeBoardHistModal.addEventListener('click', () => closeModal(boardHistModal));

            // 许愿树 绑定
            if (sideWishBtn) sideWishBtn.addEventListener('click', () => { closeSidePanel(); renderWish(); openModal(wishModal); });
            if (closeWishModal) closeWishModal.addEventListener('click', () => closeModal(wishModal));
            if (wishRefreshBtn) wishRefreshBtn.addEventListener('click', () => {
                wishRolloverDay();
                if (wishTree.stars.length >= 5) { showToast('今天的星星已经满 5 颗啦~'); return; }
                const need = 5 - wishTree.stars.length;
                wishFillToday(need);
                renderWish();
                showToast('树上多了 '+need+' 颗星星 ✨');
            });
            if (wishPhraseBtn) wishPhraseBtn.addEventListener('click', () => { renderWishPhrases(); openModal(wishPhraseModal); });
            if (closeWishPhraseModal) closeWishPhraseModal.addEventListener('click', () => closeModal(wishPhraseModal));
            if (wishPhraseAddBtn) wishPhraseAddBtn.addEventListener('click', () => {
                const v = (wishPhraseInput.value||'').trim();
                if (!v) { showToast('写一句再添加'); return; }
                wishTree.phrases[wishCurColor].push(v); saveAppearance(); wishPhraseInput.value='';
                renderWishPhrases(); showToast('已加入'+WISH_COLORS[wishCurColor].label+'愿望 ✿');
            });
            if (wishHistBtn) wishHistBtn.addEventListener('click', () => { renderWishHistory(); openModal(wishHistModal); });
            if (closeWishHistModal) closeWishHistModal.addEventListener('click', () => closeModal(wishHistModal));
            document.querySelectorAll('[data-wish-color]').forEach(b => {
                b.addEventListener('click', () => {
                    wishCurColor = b.dataset.wishColor;
                    document.querySelectorAll('[data-wish-color]').forEach(x => x.classList.toggle('active', x === b));
                    renderWishPhrases();
                });
            });

            // ========== 日历 + 跳转日期 + 心情日记 ==========
            const calendarModal = document.getElementById('calendarModal');
            const closeCalendarModal = document.getElementById('closeCalendarModal');
            const calGrid = document.getElementById('calGrid');
            const calTitle = document.getElementById('calTitle');
            const calToDiaryBtn = document.getElementById('calToDiaryBtn');

            const jumpDateModal = document.getElementById('jumpDateModal');
            const closeJumpDateModal = document.getElementById('closeJumpDateModal');
            const dlYearViewport = document.getElementById('dlYearViewport');
            const dlMonthViewport = document.getElementById('dlMonthViewport');
            const dlDayViewport = document.getElementById('dlDayViewport');
            const dlCancelBtn = document.getElementById('dlCancelBtn');
            const dlConfirmBtn = document.getElementById('dlConfirmBtn');

            const diaryModal = document.getElementById('diaryModal');
            const closeDiaryModal = document.getElementById('closeDiaryModal');
            const diaryDateLabel = document.getElementById('diaryDateLabel');
            const diaryPrevDay = document.getElementById('diaryPrevDay');
            const diaryNextDay = document.getElementById('diaryNextDay');
            const diaryTodayBtn = document.getElementById('diaryTodayBtn');
            const diaryToCalBtn = document.getElementById('diaryToCalBtn');
            const diaryInput = document.getElementById('diaryInput');
            const diarySaveBtn = document.getElementById('diarySaveBtn');
            const diaryList = document.getElementById('diaryList');
            const diaryQuickRow = document.getElementById('diaryQuickRow');
            const diaryMoodRow = document.getElementById('diaryMoodRow');
            const diaryMoodList = document.getElementById('diaryMoodList');
            const diaryInsertBtn = document.getElementById('diaryInsertBtn');
            const diaryPickPanel = document.getElementById('diaryPickPanel');

            const sideCalendarBtn = document.getElementById('sideCalendarBtn');
            const sideDiaryBtn = document.getElementById('sideDiaryBtn');

            const MOODS = ['😊 开心','🥰 甜蜜','😌 平静','😔 低落','😤 生气','😴 困倦','🥺 委屈','😇 乖巧','🌸 心动','🌙 思念'];
            const QUICK_WORDS = ['想你了', '一起看月亮吧', '晚安，我的月亮', '今天的你也很好', '抱抱', '梦里见', '谢谢你', '有你真好'];

            // 日历状态
            let calState = {
                viewYear: new Date().getFullYear(),
                viewMonth: new Date().getMonth(),  // 0-based
                selDate: formatDateKey(Date.now())   // 'YYYY-MM-DD'
            };
            // 日记状态
            let diaryState = {
                dateKey: formatDateKey(Date.now()),
                author: 'usr',
                mood: MOODS[0].split(' ')[1]  // 梦角默认心情标签
            };

            function renderCalendar() {
                if (!calGrid || !calTitle) return;
                const y = calState.viewYear, m = calState.viewMonth;
                calTitle.textContent = `${y}年${m+1}月`;
                const todayKey = formatDateKey(Date.now());
                const firstDay = new Date(y, m, 1);
                const daysInMonth = new Date(y, m + 1, 0).getDate();
                // 周一起始：周一=0 ... 周日=6
                let offset = firstDay.getDay() - 1;
                if (offset < 0) offset = 6;
                const totalCells = Math.ceil((offset + daysInMonth) / 6) * 6;
                calGrid.innerHTML = '';
                for (let i = 0; i < totalCells; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'cal-cell';
                    const dayNum = i - offset + 1;
                    if (dayNum < 1 || dayNum > daysInMonth) {
                        cell.classList.add('empty');
                        calGrid.appendChild(cell);
                        continue;
                    }
                    const pad = n => String(n).padStart(2,'0');
                    const dk = `${y}-${pad(m+1)}-${pad(dayNum)}`;
                    cell.textContent = String(dayNum);
                    if (dk === todayKey) cell.classList.add('today');
                    if (dk === calState.selDate) cell.classList.add('selected');
                    // 判断是否有日记 & 梦角心情
                    const entries = moodDiaries[dk] || [];
                    const angEntries = entries.filter(e => e.author==='angle');
                    if (entries.length) {
                        const dot = document.createElement('div');
                        dot.className = 'has-diary';
                        cell.appendChild(dot);
                    }
                    if (angEntries.length) {
                        const lastMood = angEntries.sort((a,b)=>a.ts-b.ts)[angEntries.length-1].mood;
                        if (lastMood) {
                            const mt = document.createElement('div');
                            mt.className = 'mood-tag';
                            mt.textContent = lastMood;
                            cell.appendChild(mt);
                        }
                    }
                    cell.addEventListener('click', () => {
                        calState.selDate = dk;
                        diaryState.dateKey = dk;
                        renderCalendar();
                        // 点击日期直接跳转日记
                        openDiaryFor(dk);
                    });
                    calGrid.appendChild(cell);
                }
            }

            function openCalendarFor(dateKey) {
                if (dateKey) {
                    const [y,m,_] = dateKey.split('-');
                    calState.viewYear = parseInt(y,10);
                    calState.viewMonth = parseInt(m,10)-1;
                    calState.selDate = dateKey;
                }
                renderCalendar();
                closeModal(diaryModal);
                openModal(calendarModal);
            }

            function openDiaryFor(dateKey) {
                if (dateKey) diaryState.dateKey = dateKey;
                const [y,m,d] = diaryState.dateKey.split('-');
                diaryDateLabel.textContent = `${y}年${parseInt(m,10)}月${parseInt(d,10)}日`;
                // 日历同步跳转
                calState.viewYear = parseInt(y,10);
                calState.viewMonth = parseInt(m,10)-1;
                calState.selDate = diaryState.dateKey;
                renderDiaryList();
                renderMoodList();
                renderQuickRow();
                closeModal(calendarModal);
                openModal(diaryModal);
            }

            // 心情列表（梦角写日记时选）
            function renderMoodList() {
                if (!diaryMoodList) return;
                diaryMoodList.innerHTML = '';
                MOODS.forEach(m => {
                    const [emoji, label] = m.split(' ');
                    const d = document.createElement('div');
                    d.className = 'diary-mood';
                    d.textContent = `${emoji} ${label}`;
                    if (diaryState.mood === label) d.classList.add('selected');
                    d.addEventListener('click', () => {
                        diaryState.mood = label;
                        renderMoodList();
                    });
                    diaryMoodList.appendChild(d);
                });
            }

            // 快速插入行（用户要求：梦女/梦角 tab 都去掉字卡快捷插入，只保留 Emoji 符号快捷）
            function renderQuickRow() {
                if (!diaryQuickRow) return;
                diaryQuickRow.innerHTML = '';
                const sampleEmojis = [];
                for (const g in emojiGroups) sampleEmojis.push(...(emojiGroups[g]||[]).slice(0,3));
                [...sampleEmojis.slice(0,12)].forEach(w => {
                    const c = document.createElement('div');
                    c.className = 'diary-quick-chip';
                    c.textContent = w.length > 10 ? w.slice(0,10)+'…' : w;
                    c.title = w;
                    c.addEventListener('click', () => {
                        diaryInput.value += w;
                        diaryInput.focus();
                    });
                    diaryQuickRow.appendChild(c);
                });
            }

            // 日记列表（按时间由早到晚排序）
            function renderDiaryList() {
                if (!diaryList) return;
                const entries = (moodDiaries[diaryState.dateKey] || []).slice().sort((a,b)=>a.ts-b.ts);
                diaryList.innerHTML = '';
                if (!entries.length) {
                    diaryList.innerHTML = '<div class="lib-empty">当天没有心情日记，写一条吧~</div>';
                    return;
                }
                entries.forEach(item => {
                    const d = document.createElement('div');
                    d.className = 'diary-entry ' + item.author;
                    const authorLabel = item.author === 'usr'
                        ? `<span>🌸</span><span>${userName}</span>`
                        : `<span>🌙</span><span>${angleName}</span>`;
                    const moodBlock = (item.author === 'angle' && item.mood)
                        ? `<span class="d-mood">${item.mood}</span>` : '';
                    d.innerHTML = `
                        <button class="d-del" title="删除">✕</button>
                        <div class="d-meta">
                            <div class="d-author">${authorLabel}${moodBlock}</div>
                            <div class="d-time">${formatTimeHMS(item.ts)}</div>
                        </div>
                        <div class="d-content"></div>`;
                    d.querySelector('.d-content').textContent = item.content;
                    d.querySelector('.d-del').addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!confirm('确定删除这条日记吗？')) return;
                        let arr = moodDiaries[diaryState.dateKey] || [];
                        arr = arr.filter(x => x.id !== item.id);
                        if (!arr.length) delete moodDiaries[diaryState.dateKey];
                        else moodDiaries[diaryState.dateKey] = arr;
                        saveAppearance();
                        renderDiaryList();
                        renderCalendar();
                    });
                    diaryList.appendChild(d);
                });
            }

            function saveDiary() {
                const t = (diaryInput?.value || '').trim();
                if (!t) { showToast('请先写点什么'); return; }
                if (diaryState.author === 'angle' && !diaryState.mood) {
                    showToast('梦角写日记请先选择心情'); return;
                }
                const now = Date.now();
                const dk = diaryState.dateKey;
                if (!moodDiaries[dk]) moodDiaries[dk] = [];
                const entry = {
                    id: 'diary-' + now.toString(36) + Math.random().toString(36).slice(2,6),
                    dateKey: dk,
                    ts: now,
                    author: diaryState.author,
                    content: t
                };
                if (entry.author === 'angle') entry.mood = diaryState.mood;
                moodDiaries[dk].push(entry);
                saveAppearance();
                diaryInput.value = '';
                renderDiaryList();
                renderCalendar();
                showToast('已保存');
            }

            // 梦角回复后有小概率自动写一条心情日记
            function angleAutoDiaryRandom() {
                if (!cardLibrary.length) return;
                if (Math.random() > 0.08) return;  // 8%
                const picked = cardLibrary[Math.floor(Math.random()*cardLibrary.length)];
                const mood = MOODS[Math.floor(Math.random()*MOODS.length)].split(' ')[1];
                const dk = formatDateKey(Date.now());
                if (!moodDiaries[dk]) moodDiaries[dk] = [];
                moodDiaries[dk].push({
                    id: 'diary-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
                    dateKey: dk, ts: Date.now(), author: 'angle',
                    content: picked, mood
                });
                saveAppearance();
                if (calendarModal && calendarModal.classList.contains('active')) renderCalendar();
            }

            // ============ 日历按钮绑定 ============
            if (document.getElementById('calPrevMonth')) document.getElementById('calPrevMonth').addEventListener('click', () => {
                calState.viewMonth--;
                if (calState.viewMonth < 0) { calState.viewMonth = 11; calState.viewYear--; }
                renderCalendar();
            });
            if (document.getElementById('calNextMonth')) document.getElementById('calNextMonth').addEventListener('click', () => {
                calState.viewMonth++;
                if (calState.viewMonth > 11) { calState.viewMonth = 0; calState.viewYear++; }
                renderCalendar();
            });
            if (document.getElementById('calPrevYear')) document.getElementById('calPrevYear').addEventListener('click', () => {
                calState.viewYear--; renderCalendar();
            });
            if (document.getElementById('calNextYear')) document.getElementById('calNextYear').addEventListener('click', () => {
                calState.viewYear++; renderCalendar();
            });
            if (calToDiaryBtn) calToDiaryBtn.addEventListener('click', () => openDiaryFor(calState.selDate));
            if (closeCalendarModal) closeCalendarModal.addEventListener('click', () => closeModal(calendarModal));

            // ============ 跳转日期选择器（3列滚动列表）============
            let dlSelection = { year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate() };
            function buildDLColumn(viewport, start, end, key, initial) {
                if (!viewport) return;
                viewport.innerHTML = '';
                for (let i = start; i <= end; i++) {
                    const d = document.createElement('div');
                    d.className = 'dl-item';
                    d.dataset.val = i;
                    d.textContent = i;
                    d.addEventListener('click', () => {
                        dlSelection[key] = i;
                        updateDLCenter();
                        scrollToItem(viewport, i, start);
                    });
                    viewport.appendChild(d);
                }
                // 初始滚动到指定值
                setTimeout(() => scrollToItem(viewport, initial, start), 0);
                // 滚动时找中心值
                viewport.addEventListener('scroll', () => {
                    const idx = Math.round(viewport.scrollTop / 50);
                    const val = start + idx;
                    if (val >= start && val <= end) dlSelection[key] = val;
                    updateDLCenter();
                });
            }
            function scrollToItem(viewport, val, start) {
                if (!viewport) return;
                const idx = val - start;
                // center
                viewport.scrollTop = idx * 50;
            }
            function updateDLCenter() {
                [dlYearViewport, dlMonthViewport, dlDayViewport].forEach((vp, i) => {
                    if (!vp) return;
                    const col = vp.querySelectorAll('.dl-item');
                    const target = i === 0 ? dlSelection.year : (i === 1 ? dlSelection.month : dlSelection.day);
                    col.forEach(c => c.classList.toggle('center', parseInt(c.dataset.val,10) === target));
                });
            }
            function openJumpDate() {
                const t = new Date();
                dlSelection = {
                    year: calState.viewYear,
                    month: calState.viewMonth + 1,
                    day: parseInt(calState.selDate.slice(-2),10) || t.getDate()
                };
                const daysInMonth = new Date(dlSelection.year, dlSelection.month, 0).getDate();
                buildDLColumn(dlYearViewport, 1900, 2999, 'year', dlSelection.year);
                buildDLColumn(dlMonthViewport, 1, 12, 'month', dlSelection.month);
                buildDLColumn(dlDayViewport, 1, daysInMonth, 'day', Math.min(dlSelection.day, daysInMonth));
                updateDLCenter();
                openModal(jumpDateModal);
            }
            if (document.getElementById('calJumpBtn')) document.getElementById('calJumpBtn').addEventListener('click', openJumpDate);
            if (closeJumpDateModal) closeJumpDateModal.addEventListener('click', () => closeModal(jumpDateModal));
            if (dlCancelBtn) dlCancelBtn.addEventListener('click', () => closeModal(jumpDateModal));
            if (dlConfirmBtn) dlConfirmBtn.addEventListener('click', () => {
                const y = dlSelection.year, m = dlSelection.month, d = dlSelection.day;
                // 调整日范围
                const maxD = new Date(y, m, 0).getDate();
                const finalD = Math.min(d, maxD);
                const pad = n => String(n).padStart(2,'0');
                const dk = `${y}-${pad(m)}-${pad(finalD)}`;
                calState.viewYear = y;
                calState.viewMonth = m - 1;
                calState.selDate = dk;
                diaryState.dateKey = dk;
                renderCalendar();
                closeModal(jumpDateModal);
                showToast(`已跳转到 ${y}年${m}月${finalD}日`);
            });

            // ============ 心情日记绑定 ============
            document.querySelectorAll('.diary-author-tabs button').forEach(b => b.addEventListener('click', () => {
                document.querySelectorAll('.diary-author-tabs button').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                diaryState.author = b.dataset.author;
                if (diaryMoodRow) diaryMoodRow.style.display = diaryState.author === 'angle' ? 'flex' : 'none';
            }));
            if (diaryPrevDay) diaryPrevDay.addEventListener('click', () => {
                const d = new Date(diaryState.dateKey + 'T00:00:00');
                d.setDate(d.getDate() - 1);
                openDiaryFor(formatDateKey(d.getTime()));
            });
            if (diaryNextDay) diaryNextDay.addEventListener('click', () => {
                const d = new Date(diaryState.dateKey + 'T00:00:00');
                d.setDate(d.getDate() + 1);
                openDiaryFor(formatDateKey(d.getTime()));
            });
            if (diaryTodayBtn) diaryTodayBtn.addEventListener('click', () => openDiaryFor(formatDateKey(Date.now())));
            if (diaryToCalBtn) diaryToCalBtn.addEventListener('click', () => openCalendarFor(diaryState.dateKey));
            if (closeDiaryModal) closeDiaryModal.addEventListener('click', () => closeModal(diaryModal));

            if (diarySaveBtn) diarySaveBtn.addEventListener('click', saveDiary);
            if (diaryInput) diaryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveDiary(); }
            });

            // 插入字卡/表情选择面板
            if (diaryInsertBtn && diaryPickPanel) {
                diaryInsertBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const show = diaryPickPanel.classList.toggle('show');
                    if (!show) return;
                    diaryPickPanel.innerHTML = '';
                    // 表情分组
                    let html = '<div class="qp-title">😊 表情</div><div class="qp-grid">';
                    const emoAll = [];
                    for (const g in emojiGroups) emoAll.push(...(emojiGroups[g]||[]));
                    emoAll.slice(0, 48).forEach(em => {
                        html += `<div class="qp-chip">${em}</div>`;
                    });
                    html += '</div>';
                    // 字卡
                    html += '<div class="qp-title">📜 字卡</div><div class="qp-words">';
                    (cardLibrary||[]).slice(0, 40).forEach(w => {
                        html += `<div class="qp-chip" style="width:auto;grid-column:span 1;">${w.length>10?w.slice(0,10)+'…':w}</div>`;
                    });
                    html += '</div>';
                    diaryPickPanel.innerHTML = html;
                    diaryPickPanel.querySelectorAll('.qp-chip').forEach(c => {
                        c.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            diaryInput.value += c.textContent.replace(/…$/,'');
                            diaryInput.focus();
                            diaryPickPanel.classList.remove('show');
                        });
                    });
                });
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#diaryPickPanel') && !e.target.closest('#diaryInsertBtn')) {
                        diaryPickPanel.classList.remove('show');
                    }
                });
            }

            // 侧边栏按钮：日历 + 日记
            if (sideCalendarBtn) sideCalendarBtn.addEventListener('click', () => { closeSidePanel(); openCalendarFor(formatDateKey(Date.now())); });
            if (sideDiaryBtn) sideDiaryBtn.addEventListener('click', () => { closeSidePanel(); openDiaryFor(formatDateKey(Date.now())); });

            // 遮罩点击关闭（日历/日记/跳转日期）
            [calendarModal, diaryModal, jumpDateModal].forEach(m => {
                if (m) m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
            });

            // ========== 梦角自主撤回（收到回复后有小概率撤回我的消息）==========
            const _origReply = replyWithRandomCard;
            replyWithRandomCard = function() {
                const ret = _origReply.apply(this, arguments);
                setTimeout(angleRecallUserMsgRandom, 1500);
                setTimeout(angleFavUserMsgRandom, 2000);
                setTimeout(angleMarkUserMsgRandom, 2500);  // 梦角偶尔标注梦女消息→ta 的标注
                setTimeout(angleAutoDiaryRandom, 3000);  // 梦角偶尔自动写日记+心情
                setTimeout(angleAutoSpaceLetterRandom, 3500);  // 梦角偶尔自发送时空来信
                return ret;
            };


            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (sidePanel.classList.contains('open')) closeSidePanel();
                    if (bottomSheetOpen) closeBottomSheet();
                    if (cardModal.classList.contains('active')) closeModal(cardModal);
                    if (settingsModal.classList.contains('active') && !isAnySubModalOpen()) closeModal(settingsModal);
                    if (themeModal.classList.contains('active')) closeModal(themeModal);
                    if (bgFontModal.classList.contains('active')) closeModal(bgFontModal);
                    if (bubbleModal.classList.contains('active')) closeModal(bubbleModal);
                    if (nicknameModal.classList.contains('active')) closeModal(nicknameModal);
                    if (avatarModal.classList.contains('active')) closeModal(avatarModal);
                    if (callModal.classList.contains('active')) closeModal(callModal);
                    if (emojiModal.classList.contains('active')) closeModal(emojiModal);
                    if (patModal.classList.contains('active')) closeModal(patModal);
                    if (favModal.classList.contains('active')) closeModal(favModal);
                    if (markModal.classList.contains('active')) closeModal(markModal);
                    if (calendarModal.classList.contains('active')) closeModal(calendarModal);
                    if (diaryModal.classList.contains('active')) closeModal(diaryModal);
                    if (jumpDateModal.classList.contains('active')) closeModal(jumpDateModal);
                    if (typeof envelopeModal !== 'undefined' && envelopeModal.classList.contains('active')) closeModal(envelopeModal);
                    if (typeof envLetterModal !== 'undefined' && envLetterModal.classList.contains('active')) closeModal(envLetterModal);
                }
            });
        }

        function isAnySubModalOpen() {
            const checks = [nicknameModal, avatarModal, bubbleModal, bgFontModal, themeModal, favModal, markModal, calendarModal, diaryModal, jumpDateModal];
            if (typeof envelopeModal !== 'undefined') checks.push(envelopeModal);
            if (typeof envLetterModal !== 'undefined') checks.push(envLetterModal);
            return checks.some(m => m.classList.contains('active'));
        }

        // ===== Web Audio 合成提示音（无需外部音频文件）=====
        let __sfxCtx = null;
        function playSfx(kind) {
            try {
                if (!__sfxCtx) __sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
                const ctx = __sfxCtx;
                const now = ctx.currentTime;
                const vol = Math.max(0.05, Math.min(1, chatVolume / 100));
                function tone(freq, start, dur, type, gain) {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = type || 'sine';
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0.0001, now + start);
                    g.gain.exponentialRampToValueAtTime(vol * (gain||1), now + start + 0.01);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
                    osc.connect(g); g.connect(ctx.destination);
                    osc.start(now + start); osc.stop(now + start + dur + 0.02);
                }
                if (kind === 'msg') {
                    tone(880, 0, 0.08, 'sine', 0.9);
                    tone(1320, 0.09, 0.12, 'sine', 0.8);
                } else if (kind === 'call') {
                    for (var i = 0; i < 3; i++) {
                        tone(660, i * 0.5, 0.18, 'triangle', 1);
                        tone(990, i * 0.5 + 0.2, 0.18, 'triangle', 0.9);
                    }
                } else if (kind === 'send') {
                    tone(1200, 0, 0.04, 'sine', 0.5);
                }
            } catch(e) {}
        }

        // ===== 主动写信：定时器 + 随机内容投递 =====
        function __letterUnitMs(val, unit) {
            if (unit === 'minute' || unit === 'min') return val * 60 * 1000;
            if (unit === 'hour') return val * 60 * 60 * 1000;
            if (unit === 'day') return val * 24 * 60 * 60 * 1000;
            return val * 60 * 1000;
        }
        function randLetterDelay() {
            const a = __letterUnitMs(chatLetterMin, chatLetterMinUnit);
            const b = __letterUnitMs(chatLetterMax, chatLetterMaxUnit);
            const lo = Math.min(a, b), hi = Math.max(a, b);
            return Math.max(5000, Math.floor(lo + Math.random() * Math.max(1, (hi - lo))));
        }
        function deliverAutoLetter() {
            if (!chatLetterEnabled) { restartLetterTimer(); return; }
            try {
                const titles = ['想你了', '碎碎念', '梦里见', '写给你', '今天的我', '月光下', '给你的信', '忽然想起你'];
                const t = titles[Math.floor(Math.random() * titles.length)];
                const n = 1 + Math.floor(Math.random() * 3);
                const picks = [];
                for (var i = 0; i < n; i++) if (cardLibrary.length) picks.push(cardLibrary[Math.floor(Math.random() * cardLibrary.length)]);
                var content = picks.join('\n');
                try {
                    var f = [];
                    for (var g in emojiGroups) f.push.apply(f, (emojiGroups[g]||[]));
                    if (f.length) content += '\n' + f[Math.floor(Math.random() * f.length)];
                } catch(e) {}
                if (!letterBox.mine.inbox) letterBox.mine.inbox = [];
                letterBox.mine.inbox.push({
                    id: 'L' + Date.now() + '-' + Math.floor(Math.random()*10000),
                    parentId: null, title: t, content: content,
                    from: 'angle', to: 'usr', ts: Date.now(),
                    read: false, replied: false, sourceBox: 'mine', replyTargetId: null, sourceLetterBox: 'mine', source: 'auto'
                });
                saveAppearance();
                if (typeof showToast === 'function') showToast('✉ ta来信：' + t);
                if (chatSoundMsg) playSfx('msg');
            } catch(e) {}
            restartLetterTimer();
        }
        function restartLetterTimer() {
            if (letterTimer) { clearTimeout(letterTimer); letterTimer = null; }
            if (!chatLetterEnabled) return;
            letterTimer = setTimeout(deliverAutoLetter, randLetterDelay());
        }

        // 颜色加深/减淡工具（用于 accent_deep 自动计算）
        function shade(hex, percent) {
            const num = parseInt(hex.replace('#',''), 16);
            let r = (num >> 16) + Math.round(2.55 * percent);
            let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
            let b = (num & 0x0000FF) + Math.round(2.55 * percent);
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));
            return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6,'0');
        }
        function hexToRgba(hex, alpha) {
            const h = hex.replace('#','');
            const num = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
            const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        }
        function updateAllOpacityDisplays() {
            const pairs = [
                ['themeModalOpacitySlider', 'themeModalOpacityVal', v => v + '%'],
                ['themeOverlayOpacitySlider', 'themeOverlayOpacityVal', v => v + '%'],
                ['themeModalBlurSlider', 'themeModalBlurVal', v => v + 'px'],
                ['themePageOpacitySlider', 'themePageOpacityVal', v => v + '%'],
                ['themeChatOpacitySlider', 'themeChatOpacityVal', v => v + '%'],
                ['themeInputOpacitySlider', 'themeInputOpacityVal', v => v + '%'],
                ['themeBubbleUserOpacitySlider', 'themeBubbleUserOpacityVal', v => v + '%'],
                ['themeBubbleAngleOpacitySlider', 'themeBubbleAngleOpacityVal', v => v + '%'],
            ];
            pairs.forEach(([sid, vid, fmt]) => {
                const s = document.getElementById(sid), v = document.getElementById(vid);
                if (s && v) v.textContent = fmt(s.value);
            });
        }

        // ===== 游戏模块：猜拳 / 涂鸦 / 你画我猜 =====
        const rpsModal = document.getElementById('rpsModal');
        const doodleModal = document.getElementById('doodleModal');
        const drawGuessModal = document.getElementById('drawGuessModal');
        const confirmModal = document.getElementById('confirmModal');
        const redPacketModal = document.getElementById('redPacketModal');
        const rpOpenMask = document.getElementById('rpOpenMask');

        function escapeHtml(s) {
            return String(s==null?'':s)
                .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        }
        function colorToHex(c) {
            if (!c) return '#a97bc9';
            if (c.charAt(0) === '#') {
                if (c.length === 4) return '#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];
                return c.slice(0,7);
            }
            const m = c.match(/rgba?\(([^)]+)\)/);
            if (m) { const parts = m[1].split(',').map(function(s){return parseInt(s.trim(),10);});
                const r = parts[0]||0, g = parts[1]||0, b = parts[2]||0;
                return '#'+[r,g,b].map(function(x){return ('0'+(x&255).toString(16)).slice(-2);}).join(''); }
            return '#a97bc9';
        }
        // addChatMessage 已使用 innerHTML，可直接承载 HTML
        function addChatMessageHtml(html, type) { addChatMessage(html, type || 'system'); }

        // ===== 自定义 confirm =====
        function showConfirm(title, htmlMsg) {
            return new Promise(function(res){
                const m = confirmModal;
                document.getElementById('confirmTitle').textContent = title || '确认';
                document.getElementById('confirmMsg').innerHTML = htmlMsg || '';
                m.classList.add('active');
                let done = false;
                const finish = function(v){ if (done) return; done=true; m.classList.remove('active'); res(v); };
                document.getElementById('confirmYes').onclick = function(){ finish(true); };
                document.getElementById('confirmNo').onclick = function(){ finish(false); };
                m.querySelectorAll('[data-confirm-close]').forEach(function(b){ b.onclick = function(){ finish(false); }; });
            });
        }

        // ===== 猜拳奖惩 =====
        let rpsRound = null;
        function openRpsModal() { openModal(rpsModal); renderRps(); }
        function renderRps() {
            document.querySelectorAll('#rpsRoleSwitch .chip').forEach(function(c){c.classList.toggle('active', c.dataset.role === rpsRole);});
            document.querySelectorAll('#rpsModeTabs .tab').forEach(function(t){t.classList.toggle('active', t.dataset.mode === rpsMode);});
            const s = dreamGames.rps_stats || {};
            const total = (s.dreamerWins||0)+(s.angleWins||0)+(s.ties||0);
            const rate = total ? Math.round((s.dreamerWins||0) / total * 100) : 0;
            const bar = document.getElementById('rpsStatsBar');
            if (bar) bar.innerHTML = ''
                + '<span>🎀 梦女胜 <b class="num">'+(s.dreamerWins||0)+'</b></span>'
                + '<span>🌙 梦角胜 <b class="num">'+(s.angleWins||0)+'</b></span>'
                + '<span>🤝 平局 <b class="num">'+(s.ties||0)+'</b></span>'
                + '<span>总 <b class="num">'+total+'</b></span>'
                + '<span>胜率 <b class="num">'+rate+'%</b></span>';
            const uh = document.getElementById('rpsUserHand'), ah = document.getElementById('rpsAngleHand');
            const hm = {rock:'✊', scissors:'✌️', paper:'✋'};
            if (uh) uh.innerHTML = rpsRound && rpsRound.userHand ? hm[rpsRound.userHand] : '';
            if (ah) {
                ah.classList.toggle('pending', !(rpsRound && rpsRound.angleHand));
                ah.innerHTML = rpsRound && rpsRound.angleHand ? hm[rpsRound.angleHand] : '';
            }
            const rr = document.getElementById('rpsResult');
            if (rpsRound && rpsRound.done) {
                rr.style.display = '';
                rr.className = 'rps-result ' + (rpsRound.winner === 'dreamer' ? 'win-user' : rpsRound.winner === 'angle' ? 'win-angle' : 'tie');
                const label = rpsRound.winner === 'dreamer' ? '🎉 梦女获胜！' : rpsRound.winner === 'angle' ? '🌙 梦角获胜！' : '🤝 平局';
                rr.innerHTML = label + ' <small style="opacity:0.7;">（'+(rpsRound.timeStr||'')+'）</small>';
            } else rr.style.display = 'none';
            renderRpsRuleInput();
            renderRpsHistory();
        }
        function renderRpsRuleInput() {
            const wrap = document.getElementById('rpsRuleInput'); if (!wrap) return;
            const need = rpsRound && rpsRound.done && !rpsRound.rule && rpsRound.winner !== 'tie';
            wrap.style.display = need ? '' : 'none';
            if (!need) return;
            const winnerIsDreamer = rpsRound.winner === 'dreamer';
            const proposer = rpsMode === 'angle_rules' ? 'angle' : (winnerIsDreamer ? 'dreamer' : 'angle');
            const currentWriterIsDreamer = (proposer === 'dreamer');
            const disabled = (rpsRole !== proposer);
            wrap.innerHTML = ''
                + '<div style="font-size:0.72rem; color:var(--text_secondary); margin-bottom:4px;">'
                + (rpsMode === 'angle_rules' ? '🌙 模式B：奖惩规则由 梦角 制定' : (winnerIsDreamer ? '🏆 梦女胜出 → 由梦女写奖惩' : '🌙 梦角胜出 → 由梦角写奖惩'))
                + '<br>当前视角：<b>'+(rpsRole==='dreamer'?'🎀 梦女':'🌙 梦角')+'</b> · 制定权：<b>'+(currentWriterIsDreamer?'🎀 梦女':'🌙 梦角')+'</b>'
                + '</div>'
                + '<div class="rps-rule-type-tabs" id="rpsRuleType">'
                + '<span class="c active" data-t="reward">🎁 奖励</span>'
                + '<span class="c" data-t="punish">⚡ 惩罚</span></div>'
                + '<textarea id="rpsRuleText" rows="2" placeholder="写下奖惩内容...（'+(disabled?'请切换角色到对应视角再写':'当前视角可写')+'）" '+(disabled?'disabled style="opacity:0.5; cursor:not-allowed;"':'')+'></textarea>'
                + '<div style="display:flex; justify-content:flex-end; margin-top:4px;">'
                + '<button class="btn-primary-mod" id="rpsRuleSubmitBtn" '+(disabled?'disabled style="opacity:0.5; cursor:not-allowed;"':'')+'>保存本轮奖惩</button></div>';
            wrap.querySelectorAll('#rpsRuleType .c').forEach(function(c){
                c.onclick = function() {
                    wrap.querySelectorAll('#rpsRuleType .c').forEach(function(x){x.classList.remove('active');});
                    c.classList.add('active');
                };
            });
            const sb = wrap.querySelector('#rpsRuleSubmitBtn');
            if (sb) sb.onclick = function(){
                const text = (document.getElementById('rpsRuleText').value || '').trim();
                if (!text) return showToast('请写下奖惩内容');
                const typeEl = wrap.querySelector('#rpsRuleType .c.active');
                rpsRound.rule = { type: typeEl ? typeEl.dataset.t : 'reward', text: text, proposer: proposer };
                dreamGames.rps_history.unshift({
                    mode: rpsMode, ts: Date.now(), timeStr: rpsRound.timeStr,
                    userHand: rpsRound.userHand, angleHand: rpsRound.angleHand, winner: rpsRound.winner, rule: rpsRound.rule
                });
                dreamGames.rps_stats = dreamGames.rps_stats || {};
                if (rpsRound.winner === 'dreamer') dreamGames.rps_stats.dreamerWins = (dreamGames.rps_stats.dreamerWins||0) + 1;
                else if (rpsRound.winner === 'angle') dreamGames.rps_stats.angleWins = (dreamGames.rps_stats.angleWins||0) + 1;
                saveAppearance(); renderRps(); showToast('本轮已保存 📝');
            };
        }
        function rpsJudge(u,a){ if (u===a) return 'tie'; if ((u==='rock'&&a==='scissors')||(u==='scissors'&&a==='paper')||(u==='paper'&&a==='rock')) return 'dreamer'; return 'angle'; }
        function playRps(hand){
            if (rpsRound && rpsRound.done && !rpsRound.rule && rpsRound.winner !== 'tie') return showToast('请先保存本轮奖惩再开始下一局');
            const now = new Date();
            rpsRound = { userHand: hand, angleHand: null, winner: null, done: false,
                timeStr: String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0') };
            renderRps();
            setTimeout(function(){
                const opts = ['rock','scissors','paper'];
                rpsRound.angleHand = opts[Math.floor(Math.random()*3)];
                rpsRound.winner = rpsJudge(rpsRound.userHand, rpsRound.angleHand);
                rpsRound.done = true;
                if (rpsRound.winner === 'tie') {
                    dreamGames.rps_stats.ties = (dreamGames.rps_stats.ties||0) + 1;
                    dreamGames.rps_history.unshift({
                        mode: rpsMode, ts: Date.now(), timeStr: rpsRound.timeStr,
                        userHand: rpsRound.userHand, angleHand: rpsRound.angleHand, winner: 'tie'
                    });
                    saveAppearance();
                }
                renderRps();
            }, 900 + Math.floor(Math.random() * 900));
        }
        function renderRpsHistory() {
            const list = document.getElementById('rpsHistoryList'); if (!list) return;
            const H = dreamGames.rps_history;
            if (!H.length) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text_muted);font-size:0.75rem;">📜 暂无记录，开始一局吧！</div>'; return; }
            const hm = {rock:'✊',scissors:'✌️',paper:'✋'};
            list.innerHTML = H.slice(0, 100).map(function(r){
                const winTag = r.winner==='dreamer' ? 'win' : r.winner==='angle' ? 'lose' : 'tie';
                const winText = r.winner==='dreamer'?'🎀胜':r.winner==='angle'?'🌙胜':'🤝平';
                const ruleTag = r.rule ? (r.rule.type==='reward' ? '<span class="tag reward">🎁 '+escapeHtml(r.rule.text)+'</span>' : '<span class="tag punish">⚡ '+escapeHtml(r.rule.text)+'</span>') : '';
                return '<div class="h-item">'
                    + '<div class="meta">'
                    + '<span style="font-size:0.6rem;color:var(--text_muted);min-width:50px;">'+(r.timeStr || new Date(r.ts).toLocaleTimeString().slice(0,5))+'</span>'
                    + '<span style="min-width:26px;">🎀'+(hm[r.userHand]||'?')+'</span>'
                    + '<span style="min-width:26px;">🌙'+(hm[r.angleHand]||'?')+'</span>'
                    + '<span class="tag '+winTag+'">'+winText+'</span>'
                    + (r.mode==='winner_rules'?'':'<span class="tag">模式B</span>')
                    + '</div>'
                    + '<div style="font-size:0.6rem;color:var(--text_secondary);max-width:140px;text-align:right;">'+ruleTag+'</div>'
                    + '</div>';
            }).join('');
            list.scrollTop = list.scrollHeight;
        }

        // ===== 涂鸦板 =====
        let doodleRole='dreamer', doodleTool='pencil', doodleColor='#111111', doodleWidth=3;
        let doodleUndo = [], doodleRedo = [];
        let angleDrawTimers = [];
        function clearAngleDrawTimers() {
            angleDrawTimers.forEach(t => clearTimeout(t));
            angleDrawTimers = [];
        }
        function angleAutoDraw(which) {
            clearAngleDrawTimers();
            const canvasId = which === 'doodle' ? 'doodleCanvas' : 'dgCanvas';
            const c = document.getElementById(canvasId);
            if (!c) return;
            const ctx = c.getContext('2d');
            const W = c.width, H = c.height;
            const colors = ['#e57373','#64b5f6','#81c784','#ffb74d','#ba68c8','#4dd0e1','#f06292','#a1887f'];
            ctx.lineWidth = 2 + Math.random()*3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const strokeCount = 5 + Math.floor(Math.random()*6);
            let delay = 0;
            for (let i=0;i<strokeCount;i++){
                const myColor = colors[Math.floor(Math.random()*colors.length)];
                const segs = 5 + Math.floor(Math.random()*7);
                const points = [];
                let x = Math.random()*W, y = Math.random()*H;
                points.push({x,y});
                for (let j=0;j<segs;j++){
                    x += (Math.random()-0.5)*W*0.3;
                    y += (Math.random()-0.5)*H*0.3;
                    x = Math.max(10, Math.min(W-10, x));
                    y = Math.max(10, Math.min(H-10, y));
                    points.push({x,y});
                }
                const strokeDelay = delay;
                const strokeDuration = 900 + Math.floor(Math.random()*700);
                angleDrawTimers.push(setTimeout(function(){
                    ctx.strokeStyle = myColor;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    points.forEach((pt, idx) => {
                        if (idx === 0) return;
                        angleDrawTimers.push(setTimeout(function(){
                            ctx.lineTo(pt.x, pt.y);
                            ctx.stroke();
                        }, (strokeDuration / points.length) * idx));
                    });
                }, strokeDelay));
                delay += strokeDuration + 500;
            }
            angleDrawTimers.push(setTimeout(function(){
                showToast('🌙 梦角画好啦～');
                if (which === 'doodle' && typeof doodleUndo !== 'undefined') {
                    doodleUndo.push(c.toDataURL('image/png'));
                }
            }, delay + 200));
        }
        function openDoodleModal() {
            openModal(doodleModal);
            const c = document.getElementById('doodleCanvas');
            resizeDoodleCanvas(c);
            renderDoodleToolbar(); renderDoodleGallery();
            if (!doodleUndo.length) { doodleUndo = [c.toDataURL('image/png')]; }
        }
        function resizeDoodleCanvas(c) {
            if (!c) return;
            const maxW = Math.min(800, (c.parentElement ? c.parentElement.clientWidth - 12 : 800));
            const ratio = maxW / 800;
            c.style.width = maxW + 'px';
            c.style.height = Math.round(500*ratio) + 'px';
            if (c.__inited) return;
            c.__inited = true;
            bindDoodleDraw(c, function(){
                const img = c.toDataURL('image/png');
                doodleUndo.push(img); if (doodleUndo.length > 50) doodleUndo.shift();
                doodleRedo = [];
            });
        }
        function bindDoodleDraw(c, onStrokeEnd) {
            let drawing = false; const ctx = c.getContext('2d');
            function pos(e){
                const rect = c.getBoundingClientRect();
                const t = e.touches && e.touches[0] ? e.touches[0] : e;
                const x = (t.clientX - rect.left) * (c.width / rect.width);
                const y = (t.clientY - rect.top) * (c.height / rect.height);
                return {x:x, y:y};
            }
            function start(e){ drawing = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault(); }
            function move(e){ if (!drawing) return; const p = pos(e);
                ctx.lineWidth = doodleWidth; ctx.lineCap = 'round'; ctx.lineJoin='round';
                if (doodleTool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = 'rgba(0,0,0,1)'; }
                else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = doodleColor;
                    if (doodleTool === 'marker') ctx.globalAlpha = 0.55; else ctx.globalAlpha = 1; }
                ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); }
            function end(){ if (!drawing) return; drawing=false; ctx.closePath(); if (onStrokeEnd) onStrokeEnd(); }
            c.addEventListener('mousedown', start); c.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
            c.addEventListener('touchstart', start); c.addEventListener('touchmove', move); c.addEventListener('touchend', end);
        }
        function renderDoodleToolbar() {
            const bar = document.getElementById('doodleToolbar'); if (!bar) return;
            const pal = DOODLE_PALETTE.map(function(c){ return '<span class="sw '+(c===doodleColor?'active':'')+'" data-c="'+c+'" style="background:'+c+';"></span>'; }).join('');
            bar.innerHTML = ''
                + '<select id="ddTool">'
                + '<option value="pencil"'+(doodleTool==='pencil'?' selected':'')+'>✏️ 铅笔</option>'
                + '<option value="marker"'+(doodleTool==='marker'?' selected':'')+'>🖊️ 马克笔</option>'
                + '<option value="eraser"'+(doodleTool==='eraser'?' selected':'')+'>🧽 橡皮</option></select> '
                + '<span class="palette">'+pal+'</span>'
                + ' <input type="color" id="ddColorPicker" value="'+colorToHex(doodleColor)+'" title="自定义颜色"> '
                + ' <span style="font-size:0.68rem;color:var(--text_muted);">粗细:</span> '
                + ' <input type="range" min="1" max="32" value="'+doodleWidth+'" id="ddWidth"> '
                + '<button class="mini-btn" id="ddUndo">↶ 撤销</button> '
                + '<button class="mini-btn" id="ddRedo">↷ 重做</button> '
                + '<button class="mini-btn danger" id="ddClear">🧹 清空</button> '
                + '<button class="mini-btn" id="ddAngleDraw" style="background:#dcc3ed;color:#5a3d72;">🌙 让梦角画</button> '
                + '<button class="mini-btn primary" id="ddSave">💾 保存</button>';
            const htmlRoleSwitch = document.getElementById('doodleRoleSwitch');
            if (htmlRoleSwitch) {
                htmlRoleSwitch.querySelectorAll('.chip').forEach(function(x){
                    x.onclick = function(){
                        doodleRole = x.dataset.role;
                        htmlRoleSwitch.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('active', c===x); });
                    };
                });
            }
            const angleDrawBtn = bar.querySelector('#ddAngleDraw');
            if (angleDrawBtn) angleDrawBtn.onclick = function(){ angleAutoDraw('doodle'); };
            bar.querySelectorAll('.sw').forEach(function(sw){
                sw.onclick = function(){ doodleColor = sw.dataset.c; renderDoodleToolbar(); };
            });
            const toolSel = bar.querySelector('#ddTool');
            toolSel.onchange = function(e){ doodleTool = e.target.value; };
            bar.querySelector('#ddColorPicker').oninput = function(e){ doodleColor = e.target.value; };
            bar.querySelector('#ddWidth').oninput = function(e){ doodleWidth = +e.target.value; };
            bar.querySelector('#ddUndo').onclick = doodleUndoBtn;
            bar.querySelector('#ddRedo').onclick = doodleRedoBtn;
            bar.querySelector('#ddClear').onclick = function(){ if (confirm('清空画布？')) clearDoodle(); };
            bar.querySelector('#ddSave').onclick = saveDoodle;
        }
        function clearDoodle(silent) {
            const c = document.getElementById('doodleCanvas'); if (!c) return;
            const ctx = c.getContext('2d');
            ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0,0,c.width,c.height); ctx.restore();
            const snap = c.toDataURL('image/png');
            if (silent) { doodleUndo = [snap]; doodleRedo = []; }
            else { doodleUndo.push(snap); if (doodleUndo.length>50) doodleUndo.shift(); doodleRedo = []; }
        }
        function doodleUndoBtn() {
            if (doodleUndo.length <= 1) return;
            const c = document.getElementById('doodleCanvas'); const ctx = c.getContext('2d');
            const cur = doodleUndo.pop(); doodleRedo.push(cur);
            const last = doodleUndo[doodleUndo.length-1];
            const img = new Image();
            img.onload = function(){ ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(img,0,0); }; img.src = last;
        }
        function doodleRedoBtn() {
            if (!doodleRedo.length) return;
            const c = document.getElementById('doodleCanvas'); const ctx = c.getContext('2d');
            const cur = doodleRedo.pop(); doodleUndo.push(cur);
            const img = new Image(); img.onload = function(){ ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(img,0,0); }; img.src = cur;
        }
        function saveDoodle() {
            const c = document.getElementById('doodleCanvas');
            const title = prompt('给这张画取个标题（可选）：', '') || '';
            const data = c.toDataURL('image/png');
            const img = new Image(); img.onload = function(){
                const thumb = document.createElement('canvas');
                const tw = 320, th = Math.round(tw * img.height / img.width);
                thumb.width = tw; thumb.height = th; const tx = thumb.getContext('2d');
                tx.drawImage(img, 0, 0, tw, th);
                const thumbData = thumb.toDataURL('image/png');
                dreamGames.doodles.unshift({
                    id:'D'+Date.now()+Math.floor(Math.random()*1e4),
                    author: doodleRole, title: title, img: data, thumb: thumbData,
                    w: img.width, h: img.height, ts: Date.now(),
                    timeStr: String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0')
                });
                while (dreamGames.doodles.length > DOODLE_MAX) dreamGames.doodles.pop();
                saveAppearance(); renderDoodleGallery(); showToast('已保存到画廊 🖼️'); clearDoodle();
            }; img.src = data;
        }
        function renderDoodleGallery() {
            const g = document.getElementById('doodleGallery'); if (!g) return;
            if (!dreamGames.doodles.length) { g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px 0;font-size:0.72rem;color:var(--text_muted);">🖼️ 还没有涂鸦～画一张保存吧！</div>'; return; }
            g.innerHTML = dreamGames.doodles.map(function(d){
                return '<div class="doodle-card" data-id="'+d.id+'" title="点击放大查看">'
                    + '<img src="'+(d.thumb||d.img)+'">'
                    + '<div class="dlc-meta">'+(d.author==='dreamer'?'🎀':'🌙')+' · '+(d.timeStr||'')+'</div></div>';
            }).join('');
            g.querySelectorAll('.doodle-card').forEach(function(card){
                const id = card.dataset.id; const d = dreamGames.doodles.find(function(x){return x.id===id;}); if (!d) return;
                card.onclick = function(){ showDoodleFull(d); };
            });
        }
        function showDoodleFull(d) {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';
            wrap.innerHTML = ''
                + '<div style="background:var(--bg_card,white);border-radius:16px;padding:14px;max-width:560px;max-height:90vh;overflow:auto;">'
                + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
                + '<div style="font-size:0.8rem;"><b>'+(d.author==='dreamer'?'🎀 梦女':'🌙 梦角')+'</b> · '+escapeHtml(d.title||'（无标题）')+' · <small style="opacity:0.5;">'+new Date(d.ts).toLocaleString()+'</small></div>'
                + '<button class="mini-btn danger" id="dfClose">✕</button>'
                + '</div><img src="'+d.img+'" style="max-width:100%;border-radius:10px;display:block;">'
                + '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap;">'
                + '<button class="mini-btn" id="dfSend">💬 发送到聊天</button> '
                + '<a class="mini-btn primary" download="doodle-'+d.id+'.png" href="'+d.img+'">⬇️ 下载 PNG</a> '
                + '<button class="mini-btn danger" id="dfDelete">🗑 删除</button>'
                + '</div></div>';
            document.body.appendChild(wrap);
            function close(){ if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
            wrap.querySelector('#dfClose').onclick = close;
            wrap.addEventListener('click', function(e){ if (e.target === wrap) close(); });
            wrap.querySelector('#dfSend').onclick = function(){
                addChatMessageHtml('<img class="msg-doodle-img" src="'+(d.thumb||d.img)+'"><small>'+(d.author==='dreamer'?'🎀 我的涂鸦':'🌙 梦角的涂鸦')+'：'+escapeHtml(d.title||'(无标题)')+'</small>',
                    d.author === 'dreamer' ? 'user' : 'angle');
                close(); closeModal(doodleModal);
            };
            wrap.querySelector('#dfDelete').onclick = function(){
                if (!confirm('确认删除这张涂鸦？')) return;
                const i = dreamGames.doodles.findIndex(function(x){ return x.id === d.id; });
                if (i>=0) dreamGames.doodles.splice(i,1);
                saveAppearance(); renderDoodleGallery(); close();
            };
        }

        // ===== 你画我猜 =====
        let dgRound = null, dgCategory = null;
        function dgMergeTopics(){
            const t = {};
            Object.keys(DEFAULT_DRAW_TOPICS).forEach(function(k){ t[k] = DEFAULT_DRAW_TOPICS[k].slice(); });
            Object.keys(dreamGames.draw_guess_topics||{}).forEach(function(k){
                if (!t[k]) t[k] = [];
                (dreamGames.draw_guess_topics[k]||[]).forEach(function(x){ if (t[k].indexOf(x) < 0) t[k].push(x); });
            });
            return t;
        }
        function openDrawGuessModal() { openModal(drawGuessModal); initDgCanvas(); renderDg(); }
        function initDgCanvas() {
            const c = document.getElementById('dgCanvas'); if (!c || c.__inited) return;
            c.__inited = true;
            const maxW = Math.min(800, (c.parentElement ? c.parentElement.clientWidth - 12 : 800));
            const ratio = maxW / 800;
            c.style.width = maxW + 'px'; c.style.height = Math.round(460*ratio)+'px';
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,c.width,c.height);
            let drawing = false, tool = 'pencil', w = 4, col = '#111111';
            if (!document.getElementById('dgToolbar')) {
                const t = document.createElement('div'); t.id='dgToolbar'; t.className='doodle-toolbar';
                t.style.margin = '6px 0';
                const pal = DOODLE_PALETTE.slice(0,12).map(function(x){return '<span class="sw" data-c="'+x+'" style="background:'+x+'"></span>';}).join('');
                t.innerHTML = ''
                    + '<select><option value="pencil">✏️ 铅笔</option><option value="marker">🖊️ 马克笔</option><option value="eraser">🧽 橡皮</option></select> '
                    + '<span class="palette">'+pal+'</span> '
                    + '<input type="color" value="#111111" title="自定义颜色" style="width:26px;height:26px;padding:0;border:1px solid var(--bg_border);border-radius:6px;cursor:pointer;background:transparent;"> '
                    + '<span style="font-size:0.68rem;color:var(--text_muted);">粗细:</span> '
                    + '<input type="range" min="1" max="28" value="4"> '
                    + '<button class="mini-btn danger">🧹 清空</button>';
                c.parentElement.parentElement.insertBefore(t, c.parentElement);
                const selectEl = t.querySelector('select');
                const colorSws = t.querySelectorAll('.sw');
                const colorPicker = t.querySelector('input[type=color]');
                const range = t.querySelector('input[type=range]');
                const clr = t.querySelector('.mini-btn.danger');
                selectEl.onchange = function(){ tool = selectEl.value; };
                range.oninput = function(){ w = +range.value; };
                colorSws.forEach(function(s){ s.onclick = function(){ col = s.dataset.c; colorPicker.value = colorToHex(s.dataset.c); colorSws.forEach(function(x){x.classList.toggle('active', x===s);}); }; });
                colorPicker.oninput = function(){ col = colorPicker.value; colorSws.forEach(function(x){x.classList.remove('active');}); };
                clr.onclick = function(){ ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height); ctx.restore(); };
            }
            function pos(e){
                const rect = c.getBoundingClientRect();
                const t0 = e.touches && e.touches[0] ? e.touches[0] : e;
                return { x: (t0.clientX-rect.left) * c.width/rect.width, y: (t0.clientY-rect.top) * c.height/rect.height };
            }
            function start(e){ drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault(); }
            function move(e){ if (!drawing) return; const p=pos(e); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=w;
                if (tool==='eraser') { ctx.globalCompositeOperation='destination-out'; ctx.strokeStyle='rgba(0,0,0,1)'; }
                else { ctx.globalCompositeOperation='source-over'; ctx.strokeStyle=col; ctx.globalAlpha = tool==='marker'?0.55:1; }
                ctx.lineTo(p.x,p.y); ctx.stroke(); e.preventDefault(); }
            function end(){ if (drawing){drawing=false; ctx.closePath();} }
            c.addEventListener('mousedown',start); c.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
            c.addEventListener('touchstart',start); c.addEventListener('touchmove',move); c.addEventListener('touchend',end);
        }
        function renderDg() {
            document.querySelectorAll('#dgModeTabs .tab').forEach(function(t){ t.classList.toggle('active', t.dataset.mode===dgMode); });
            document.querySelectorAll('#dgRoleSwitch .chip').forEach(function(c){ c.classList.toggle('active', c.dataset.role===dgRole); });
            const H = dreamGames.draw_guess_history;
            const rightDreamer = H.filter(function(h){ return h.result==='hit' && h.guesser==='dreamer'; }).length;
            const rightAngle = H.filter(function(h){ return h.result==='hit' && h.guesser==='angle'; }).length;
            const bar = document.getElementById('dgStatsBar');
            if (bar) bar.innerHTML = ''
                + '<span>🎀 梦女答对 <b class="num">'+rightDreamer+'</b></span>'
                + '<span>🌙 梦角答对 <b class="num">'+rightAngle+'</b></span>'
                + '<span>总轮数 <b class="num">'+H.length+'</b></span>';
            const wr = document.getElementById('dgWordRow');
            if (!dgRound) {
                wr.innerHTML = '<span class="label">💡 还没开始～点击"开启新一轮"开始吧！</span>';
            } else {
                const elapsed = Math.max(0, dgRound.duration - Math.floor(((Date.now()-dgRound.startTs)/1000)));
                const guesser = dgRound.artist === 'dreamer' ? 'angle' : 'dreamer';
                const showWord = (dgRole === dgRound.artist);
                let html = ''
                    + '<span class="label">本轮：</span>'
                    + '<span class="word">'+(showWord ? escapeHtml(dgRound.word) : '（🎨 '+(dgRound.artist==='dreamer'?'梦女':'梦角')+'正在画...请猜）')+'</span> '
                    + '<span class="label">话题：</span><b>'+(dgRound.category||'自由画')+'</b> '
                    + '<span class="label">画家：</span><b>'+(dgRound.artist==='dreamer'?'🎀 梦女':'🌙 梦角')+'</b> '
                    + '<span class="label">猜的人：</span><b>'+(guesser==='dreamer'?'🎀 梦女':'🌙 梦角')+'</b> '
                    + '<span class="countdown">⏳ '+elapsed+'s</span>';
                if (dgRound.guesses && dgRound.guesses.length) {
                    html += '<div style="margin-top:6px; font-size:0.7rem; color:var(--text_secondary);">猜题记录：';
                    dgRound.guesses.forEach(function(g){
                        const who = g.who === 'dreamer' ? '🎀' : '🌙';
                        html += ' '+who+(g.hit?'✅':'❌')+escapeHtml(g.text)+'';
                    });
                    html += '</div>';
                }
                wr.innerHTML = html;
            }
            const topWrap = document.getElementById('dgTopicsWrap');
            topWrap.style.display = dgMode === 'topic' ? '' : 'none';
            if (dgMode === 'topic') {
                const tags = document.getElementById('dgTopicTags');
                const top = dgMergeTopics();
                tags.innerHTML = Object.keys(top).map(function(k){
                    return '<span class="tag '+(dgCategory===k?'active':'')+'" data-k="'+escapeHtml(k)+'">'+escapeHtml(k)+' <small style="opacity:0.55;">('+(top[k]||[]).length+')</small></span>';
                }).join('');
                tags.querySelectorAll('.tag').forEach(function(tg){ tg.onclick = function(){ dgCategory = tg.dataset.k; renderDg(); }; });
            }
            renderDgHistory();
            const mgrWrap = document.getElementById('dgTopicMgrWrap'); if (!mgrWrap) return;
            if (mgrWrap.dataset.open !== '1') { mgrWrap.innerHTML = ''; return; }
            const top2 = dgMergeTopics();
            let html = '<hr class="mod-divider"><div style="font-size:0.7rem;font-weight:500;color:var(--text_secondary);margin-bottom:6px;">🧰 话题管理（可增删分类和词）</div><div class="dg-topic-mgr">';
            Object.keys(top2).forEach(function(k){
                const inpIdK = 'inp_'+btoa(unescape(encodeURIComponent(k))).replace(/[+=/]/g,'_').slice(0,24);
                html += '<div class="row"><b style="min-width:80px;">'+escapeHtml(k)+'</b>';
                html += (top2[k]||[]).map(function(w){
                    return '<span style="padding:2px 6px;border-radius:10px;background:rgba(245,240,250,0.6);margin:2px;font-size:0.65rem;display:inline-flex;align-items:center;gap:4px;">'+escapeHtml(w)
                         + ' <button class="mini-btn danger" style="padding:0 4px;" data-delw="'+escapeHtml(k)+'" data-w="'+escapeHtml(w)+'">✕</button></span>';
                }).join(' ');
                html += ' <input placeholder="+ 新词" data-addw="'+escapeHtml(k)+'" id="'+inpIdK+'" style="min-width:80px;">'
                     +  ' <button class="mini-btn primary" data-addwordbtn="'+escapeHtml(k)+'">加词</button>'
                     +  ' <button class="mini-btn danger" data-delcat="'+escapeHtml(k)+'">删除分类</button></div>';
            });
            html += '<div class="row"><input placeholder="新分类名（emoji + 文字可）" id="dgNewCat"><button class="mini-btn primary" id="dgAddCat">➕ 新建分类</button></div>';
            html += '</div>';
            mgrWrap.innerHTML = html;
            mgrWrap.querySelectorAll('[data-delw]').forEach(function(b){ b.onclick = function(){
                const k = b.dataset.delw, w = b.dataset.w;
                const base = (DEFAULT_DRAW_TOPICS[k]||[]).slice();
                const extras = (dreamGames.draw_guess_topics[k]||[]).filter(function(x){ return base.indexOf(x) < 0; });
                dreamGames.draw_guess_topics[k] = base.concat(extras).filter(function(x){ return x !== w; });
                saveAppearance(); renderDg();
            };});
            mgrWrap.querySelectorAll('[data-addwordbtn]').forEach(function(b){ b.onclick = function(){
                const k = b.dataset.addwordbtn;
                const inp = mgrWrap.querySelector('input[data-addw="'+k.replace(/"/g,'\\"')+'"]');
                if (!inp) return;
                const v = (inp.value||'').trim(); if (!v) return;
                if (!dreamGames.draw_guess_topics[k]) dreamGames.draw_guess_topics[k] = [];
                if (dreamGames.draw_guess_topics[k].indexOf(v) < 0) dreamGames.draw_guess_topics[k].push(v);
                saveAppearance(); renderDg();
            };});
            mgrWrap.querySelectorAll('[data-delcat]').forEach(function(b){ b.onclick = function(){
                const k = b.dataset.delcat; if (!confirm('删除分类？ '+k)) return;
                dreamGames.draw_guess_topics[k] = [];
                if (dgCategory === k) dgCategory = null;
                saveAppearance(); renderDg();
            };});
            const ac = document.getElementById('dgAddCat'); if (ac) ac.onclick = function(){
                const v = (document.getElementById('dgNewCat').value||'').trim(); if (!v) return;
                if (!dreamGames.draw_guess_topics[v]) dreamGames.draw_guess_topics[v] = [];
                saveAppearance(); renderDg();
            };
        }
        const DG_ANGLE_ANSWERS = ['太阳','月亮','星星','花朵','猫咪','小狗','房子','汽车','飞机','鱼','树','云','爱心','雨伞','蛋糕','苹果','香蕉','蝴蝶','彩虹','雪人','小鸟','兔子','钟表','电视','手机','书','笔','椅子','桌子','杯子','灯泡','钥匙','气球','风筝','冰淇淋','汉堡','披萨','面条','糖果','礼物','雪花','火焰','水滴','山','海','河','桥','塔','门','窗','床','沙发','枕头','被子','衣服','鞋子','帽子','眼镜','手表','项链','戒指','耳环','钱包','背包','雨衣','手套','围巾','袜子','裙子','裤子','衬衫','外套','梦','心','吻','泪','笑','爱','抱','手','眼','唇','发','月','星','花','风','雨','雪','云','海','梦','光','影'];
        let dgAngleGuessTimer = null;
        function dgStartTimer() {
            if (dgTimer) clearInterval(dgTimer);
            if (dgAngleGuessTimer) { clearInterval(dgAngleGuessTimer); dgAngleGuessTimer = null; }
            if (dgRound && dgRound.artist === 'dreamer' && dgRound.guesser === 'angle') {
                let guessCount = 0;
                dgAngleGuessTimer = setInterval(function(){
                    if (!dgRound || dgRound.result) return;
                    guessCount++;
                    if (guessCount > 6) return;
                    const hitChance = guessCount >= 3 ? 0.35 : 0.15;
                    if (Math.random() < hitChance) {
                        const v = dgRound.word;
                        dgRound.guesses.push({who:'angle', text:v, hit:true});
                        dgRound.result = 'hit'; dgRound.endTs = Date.now();
                        const thumb = dgCaptureThumb();
                        dreamGames.draw_guess_history.unshift(Object.assign({}, dgRound, {img: thumb}));
                        while (dreamGames.draw_guess_history.length > DRAW_GUESS_MAX) dreamGames.draw_guess_history.pop();
                        clearInterval(dgTimer); dgTimer = null;
                        clearInterval(dgAngleGuessTimer); dgAngleGuessTimer = null;
                        addChatMessage('🖌️ 你画我猜：🌙 梦角猜对啦！答案是「'+dgRound.word+'」🎉', 'system');
                        dgRound = null; saveAppearance(); renderDg();
                        showConfirm('🎉 梦角猜对了！', '🌙 梦角猜出了你的画！答案是「<b>'+v+'</b>』');
                    } else {
                        const pool = DG_ANGLE_ANSWERS.filter(function(a){ return a !== dgRound.word; });
                        const wrong = pool[Math.floor(Math.random()*pool.length)];
                        dgRound.guesses.push({who:'angle', text:wrong, hit:false});
                        renderDg();
                    }
                }, 8000 + Math.floor(Math.random()*4000));
            }
            dgTimer = setInterval(function(){
                if (!dgRound) return;
                const left = dgRound.duration - Math.floor((Date.now()-dgRound.startTs)/1000);
                if (left <= 0) {
                    dgRound.result = 'timeout'; dgRound.endTs = Date.now();
                    const thumb = dgCaptureThumb();
                    dreamGames.draw_guess_history.unshift(Object.assign({}, dgRound, {img:thumb}));
                    while (dreamGames.draw_guess_history.length > DRAW_GUESS_MAX) dreamGames.draw_guess_history.pop();
                    addChatMessage('🖌️ 你画我猜：本轮「'+dgRound.word+'」时间到啦～ 还没猜到哦 ⏰', 'system');
                    const endedWord = dgRound.word;
                    dgRound = null; saveAppearance();
                    clearInterval(dgTimer); dgTimer = null;
                    if (dgAngleGuessTimer) { clearInterval(dgAngleGuessTimer); dgAngleGuessTimer = null; }
                    renderDg();
                    showConfirm('⏰ 时间到！', '本轮你画我猜结束啦～<br>正确答案是「<b>'+endedWord+'</b>』');
                    return;
                }
                renderDg();
            }, 500);
        }
        function dgCaptureThumb() {
            const c = document.getElementById('dgCanvas'); if (!c) return '';
            const thumb = document.createElement('canvas');
            const ratio = 320 / c.width; thumb.width = 320; thumb.height = Math.round(c.height * ratio);
            thumb.getContext('2d').drawImage(c, 0, 0, thumb.width, thumb.height);
            return thumb.toDataURL('image/png');
        }
        function startDgRound() {
            if (dgRound) return showToast('当前轮未结束～');
            let word = '', category = null;
            if (dgMode === 'topic') {
                const merged = dgMergeTopics();
                const keys = Object.keys(merged).filter(function(k){return (merged[k]||[]).length;});
                if (!keys.length) return showToast('话题词库为空，请先在话题管理里添加词！');
                const cat = dgCategory && merged[dgCategory] && merged[dgCategory].length ? dgCategory : keys[Math.floor(Math.random()*keys.length)];
                const pool = merged[cat]; category = cat; dgCategory = cat;
                word = pool[Math.floor(Math.random()*pool.length)];
            } else {
                if (dgRole === 'angle') {
                    const pool = ['太阳','月亮','星星','花朵','猫咪','小狗','房子','汽车','飞机','鱼','树','云','爱心','雨伞','蛋糕','苹果','香蕉','蝴蝶','彩虹','雪人'];
                    word = pool[Math.floor(Math.random()*pool.length)];
                } else {
                    const input = prompt('🎀 请输入你要画的题目（对方将猜这个词）：');
                    if (!input || !input.trim()) return;
                    word = input.trim();
                }
            }
            const guesser = dgRole === 'dreamer' ? 'angle' : 'dreamer';
            const now = new Date();
            dgRound = {
                id: 'DG'+now.getTime()+Math.floor(Math.random()*1e4),
                mode: dgMode, category: category, word: word,
                artist: dgRole, guesser: guesser, result: null,
                duration: 90, startTs: now.getTime(), ts: now.getTime(),
                timeStr: String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),
                guesses: []
            };
            const c = document.getElementById('dgCanvas');
            if (c) { const ctx = c.getContext('2d'); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height); }
            dgStartTimer(); renderDg();
            if (dgRound.artist === 'angle') {
                setTimeout(function(){ angleAutoDraw('dg'); }, 500);
            }
        }
        function dgGuess() {
            if (!dgRound) return showToast('先开启新一轮吧！');
            if (dgRole !== dgRound.guesser) return showToast('当前视角是'+(dgRole==='dreamer'?'🎀 梦女（画家）':'🌙 梦角（画家）')+'，不能猜哦～请切换到猜的人视角！');
            const v = (document.getElementById('dgGuessInput').value||'').trim(); if (!v) return;
            const w = dgRound.word;
            const hit = v === w || (v.length>=2 && w.indexOf(v)>=0) || (w.length>=2 && v.indexOf(w)>=0);
            dgRound.guesses.push({who: dgRole, text: v, hit: hit});
            document.getElementById('dgGuessInput').value = '';
            if (hit) {
                dgRound.result = 'hit'; dgRound.endTs = Date.now();
                const thumb = dgCaptureThumb();
                dreamGames.draw_guess_history.unshift(Object.assign({}, dgRound, {img: thumb}));
                while (dreamGames.draw_guess_history.length > DRAW_GUESS_MAX) dreamGames.draw_guess_history.pop();
                clearInterval(dgTimer); dgTimer = null;
                if (dgAngleGuessTimer) { clearInterval(dgAngleGuessTimer); dgAngleGuessTimer = null; }
                addChatMessage('🖌️ 你画我猜新纪录：['+(dgRound.artist==='dreamer'?'🎀 梦女':'🌙 梦角')+'] 出题「'+dgRound.word+'」，['+(dgRound.guesser==='dreamer'?'🎀 梦女':'🌙 梦角')+'] 猜对啦！🎉', 'system');
                dgRound = null; saveAppearance(); renderDg();
                showConfirm('🎉 猜对了！', '答案是「<b>'+w+'</b>」，你猜对啦！');
            } else {
                renderDg();
                showConfirm('❌ 猜错了', '你猜的「<b>'+v+'</b>」不对哦，再想想看～<br><small style="opacity:0.6;">提示：答案共 '+w.length+' 个字</small>');
            }
        }
        function renderDgHistory() {
            const list = document.getElementById('dgHistoryList'); if (!list) return;
            const H = dreamGames.draw_guess_history;
            if (!H.length) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text_muted);font-size:0.75rem;">还没有记录～来一局你画我猜吧！</div>'; return; }
            list.innerHTML = H.slice(0, 80).map(function(h){
                return '<div class="item">'
                    + '<img src="'+(h.img||'')+'" style="width:48px;height:40px;object-fit:cover;border-radius:6px;border:1px solid rgba(0,0,0,0.08);">'
                    + '<span style="flex:1;">'
                    + '<b>'+(h.result==='hit'?'🎉 答对':'⏰ 超时')+'</b>'
                    + ' <small style="opacity:0.5;">'+(h.mode==='topic'?'话题':'自由画')+'</small><br>'
                    + escapeHtml(h.category||'') + ' · 答案：<b>'+escapeHtml(h.word)+'</b><br>'
                    + '<small style="opacity:0.6;">🎨'+(h.artist==='dreamer'?'🎀':'🌙')+' 画 · 猜题 '+(h.guesser==='dreamer'?'🎀':'🌙')+' · '+(h.timeStr||'')+'</small>'
                    + '</span><button class="mini-btn danger" data-del="'+h.id+'">🗑</button></div>';
            }).join('');
            list.querySelectorAll('[data-del]').forEach(function(b){ b.onclick = function(){
                if (!confirm('删除这条记录？')) return;
                dreamGames.draw_guess_history = dreamGames.draw_guess_history.filter(function(x){ return x.id !== b.dataset.del; });
                saveAppearance(); renderDgHistory(); renderDg();
            };});
        }

        // ===== 虚拟红包模块 =====
        function rpFmt(n) { return (Math.round(Number(n)*100)/100).toFixed(2); }

        function renderWallet() {
            const da = document.getElementById('rpDreamerAmt');
            const aa = document.getElementById('rpAngleAmt');
            if (da) da.textContent = '¥' + rpFmt(dreamGames.wallet.dreamer);
            if (aa) aa.textContent = '¥' + rpFmt(dreamGames.wallet.angle);
            const hint = document.getElementById('rpBalanceHint');
            if (hint) {
                const amt = parseFloat(document.getElementById('rpAmountInput').value) || 0;
                if (amt <= 0) hint.textContent = '梦女余额 ¥' + rpFmt(dreamGames.wallet.dreamer) + '，尽情发吧～';
                else if (amt > dreamGames.wallet.dreamer) hint.textContent = '⚠️ 余额不足，还差 ¥' + rpFmt(amt - dreamGames.wallet.dreamer);
                else hint.textContent = '发送后梦女余额 ¥' + rpFmt(dreamGames.wallet.dreamer - amt);
            }
        }

        function openRedPacketModal() {
            renderWallet();
            document.getElementById('rpAmountInput').value = '';
            document.getElementById('rpGreetingInput').value = '';
            openModal(redPacketModal);
        }

        function editRPBalance(who) {
            const row = document.getElementById(who === 'dreamer' ? 'rpWalletDreamer' : 'rpWalletAngle');
            if (!row) return;
            // 已存在编辑框则不再重复添加
            if (row.querySelector('.rp-balance-edit')) return;
            const cur = dreamGames.wallet[who];
            const edit = document.createElement('div');
            edit.className = 'rp-balance-edit';
            edit.innerHTML = '<input type="number" min="0" step="0.01" value="' + rpFmt(cur) + '" placeholder="金额">' +
                             '<button type="button">确定</button>' +
                             '<button type="button" data-cancel>取消</button>';
            row.appendChild(edit);
            const input = edit.querySelector('input');
            input.focus(); input.select();
            const apply = function() {
                const n = parseFloat(input.value);
                if (!isNaN(n) && n >= 0) {
                    dreamGames.wallet[who] = Math.round(n*100)/100;
                    saveAppearance();
                    renderWallet();
                } else {
                    alert('请输入有效的金额');
                }
                if (edit.parentNode) edit.parentNode.removeChild(edit);
            };
            edit.querySelector('button').onclick = apply;
            edit.querySelector('[data-cancel]').onclick = function(){ if (edit.parentNode) edit.parentNode.removeChild(edit); };
            input.addEventListener('keydown', function(e){ if (e.key === 'Enter') apply(); if (e.key === 'Escape') edit.querySelector('[data-cancel]').click(); });
        }

        function sendRedPacket() {
            const amt = parseFloat(document.getElementById('rpAmountInput').value);
            if (!amt || amt <= 0) { alert('请输入红包金额'); return; }
            if (amt > dreamGames.wallet.dreamer) { alert('梦女余额不足！'); return; }
            const greeting = (document.getElementById('rpGreetingInput').value.trim() || '恭喜发财，大吉大利').slice(0, 30);

            dreamGames.wallet.dreamer = Math.round((dreamGames.wallet.dreamer - amt)*100)/100;
            const rpId = 'rp-' + Date.now();
            const record = { id: rpId, amount: amt, greeting: greeting, sender: 'dreamer', opened: false, ts: Date.now() };
            dreamGames.red_packet_history.unshift(record);
            if (dreamGames.red_packet_history.length > 100) dreamGames.red_packet_history.pop();
            saveAppearance();

            // 聊天中插入红包卡片（梦女发送）
            const cardHtml =
                '<div class="msg-red-packet rp-card" data-rp-id="' + rpId + '" data-rp-status="unopened">' +
                    '<div class="rp-card-icon">🧧</div>' +
                    '<div class="rp-card-body">' +
                        '<div class="rp-card-greeting">' + escapeHtml(greeting) + '</div>' +
                        '<div class="rp-card-status">微信红包</div>' +
                        '<div class="rp-card-amount">¥' + rpFmt(amt) + '</div>' +
                    '</div>' +
                '</div>';
            addChatMessage(cardHtml, 'user');

            closeModal(redPacketModal);
            showToast('🧧 红包已发出 ¥' + rpFmt(amt));

            // 梦角延迟领取
            setTimeout(function() { autoOpenRedPacket(rpId); }, 1800 + Math.random()*2200);
        }

        function autoOpenRedPacket(rpId) {
            const rec = dreamGames.red_packet_history.find(function(x){ return x.id === rpId; });
            if (!rec || rec.opened) return;
            // 梦角领取：更新余额与记录
            dreamGames.wallet.angle = Math.round((dreamGames.wallet.angle + rec.amount)*100)/100;
            rec.opened = true;
            saveAppearance();

            // 更新聊天卡片状态
            const card = document.querySelector('.rp-card[data-rp-id="' + rpId + '"]');
            if (card) {
                card.classList.add('opened');
                const st = card.querySelector('.rp-card-status');
                if (st) st.textContent = '已被梦角领取';
            }
            addChatMessage('🌙 拆开了你的红包，获得 ¥' + rpFmt(rec.amount) + ' 💰', 'angle');
        }

        // 点击聊天中的红包卡片 → 展示拆红包动画（若已领则显示详情）
        function viewRedPacket(rpId) {
            const rec = dreamGames.red_packet_history.find(function(x){ return x.id === rpId; });
            if (!rec) return;
            document.getElementById('rpOpenFrom').textContent = '来自 🎀 梦女 的红包';
            document.getElementById('rpOpenGreeting').textContent = rec.greeting;
            document.getElementById('rpOpenAmount').textContent = rpFmt(rec.amount);
            document.getElementById('rpOpenTip').textContent = rec.opened ? '已存入梦角余额 ¥' + rpFmt(rec.amount) : '点击拆开领取';
            const circle = document.getElementById('rpOpenCircle');
            const result = document.getElementById('rpOpenResult');
            if (rec.opened) {
                circle.style.display = 'none';
                result.style.display = 'block';
            } else {
                circle.style.display = 'flex';
                result.style.display = 'none';
            }
            rpOpenMask.classList.add('active');
        }

        function doOpenRP() {
            // 用户手动拆（一般由 autoOpenRedPacket 自动处理，这里仅作展示）
            const result = document.getElementById('rpOpenResult');
            document.getElementById('rpOpenCircle').style.display = 'none';
            result.style.display = 'block';
        }

        function closeRPOpen() { rpOpenMask.classList.remove('active'); }

        // ===== 梦女提议 → 梦角随机同意/拒绝 =====
        var RP_ACCEPT_PHRASES = [
            '好呀，那就这样吧～',
            '嗯，同意！',
            '没问题 💕',
            '好的好的～',
            '可以呀，听你的！',
            '嗯嗯，就这样决定啦！',
            '听起来不错呢 🌸'
        ];
        var RP_REJECT_PHRASES = [
            '唔...这次就先不要啦 😢',
            '暂时不想哦～',
            '再考虑一下吧...',
            '这次就不了好不好？',
            '下次再玩嘛 👉👈',
            '嗯...不太想呢...',
            '下次一定！'
        ];
        function dreamerProposesSwitch(acceptMsg, rejectMsg, onDecision) {
            // 梦角先"思考"一下，再随机决定
            setTimeout(function(){
                var accepted = Math.random() < 0.5;
                var phrases = accepted ? RP_ACCEPT_PHRASES : RP_REJECT_PHRASES;
                var reply = phrases[Math.floor(Math.random()*phrases.length)];
                addChatMessage(reply, 'angle');
                setTimeout(function(){
                    addChatMessage(accepted ? acceptMsg : rejectMsg, 'system');
                    onDecision(accepted);
                }, 600 + Math.random()*800);
            }, 800 + Math.random()*1200);
        }

        // ===== 游戏事件绑定 =====
        function bindGameEvents() {
            // 底部入口
            const brps = document.getElementById('bottomRpsBtn'); if (brps) brps.addEventListener('click', function(){ closeBottomSheet(); openRpsModal(); });
            const bdood = document.getElementById('bottomDoodleBtn'); if (bdood) bdood.addEventListener('click', function(){ closeBottomSheet(); openDoodleModal(); });
            const bdg = document.getElementById('bottomDGBtn'); if (bdg) bdg.addEventListener('click', function(){ closeBottomSheet(); openDrawGuessModal(); });
            // 侧边栏小游戏入口
            const sRps = document.getElementById('sideRpsBtn'); if (sRps) sRps.addEventListener('click', function(){ closeSidePanel(); openRpsModal(); });
            const sDood = document.getElementById('sideDoodleBtn'); if (sDood) sDood.addEventListener('click', function(){ closeSidePanel(); openDoodleModal(); });
            const sDG = document.getElementById('sideDrawGuessBtn'); if (sDG) sDG.addEventListener('click', function(){ closeSidePanel(); openDrawGuessModal(); });
            const brp = document.getElementById('bottomRPBtn'); if (brp) brp.addEventListener('click', function(){ closeBottomSheet(); openRedPacketModal(); });

            // 红包
            const crp = document.getElementById('closeRPModal');
            if (crp) { crp.onclick = function(){ closeModal(redPacketModal); }; redPacketModal.addEventListener('click', function(e){ if (e.target === redPacketModal) closeModal(redPacketModal); }); }
            document.querySelectorAll('#redPacketModal .edit-btn').forEach(function(b){ b.onclick = function(){ editRPBalance(b.dataset.edit); }; });
            const rpAmtIn = document.getElementById('rpAmountInput'); if (rpAmtIn) rpAmtIn.addEventListener('input', renderWallet);
            const rpSend = document.getElementById('rpSendBtn'); if (rpSend) rpSend.onclick = sendRedPacket;
            // 聊天红包卡片点击（委托到 chatBox）
            if (chatBox) chatBox.addEventListener('click', function(e){
                const card = e.target.closest('.rp-card');
                if (card) viewRedPacket(card.dataset.rpId);
            });
            // 拆红包弹层
            const rpCircle = document.getElementById('rpOpenCircle'); if (rpCircle) rpCircle.onclick = doOpenRP;
            const rpClose = document.getElementById('rpOpenClose'); if (rpClose) rpClose.onclick = closeRPOpen;
            if (rpOpenMask) rpOpenMask.addEventListener('click', function(e){ if (e.target === rpOpenMask) closeRPOpen(); });

            // RPS
            const crM = document.getElementById('closeRpsModal');
            if (crM) { crM.onclick = function(){ closeModal(rpsModal); }; rpsModal.addEventListener('click', function(e){ if (e.target === rpsModal) closeModal(rpsModal); }); }
            document.querySelectorAll('#rpsRoleSwitch .chip').forEach(function(c){ c.addEventListener('click', function(){
                var nr = c.dataset.role;
                if (nr === 'angle' && rpsMode === 'winner_rules' && rpsRole !== 'angle') {
                    dreamerProposesSwitch(
                        '📝 梦女开启了双方奖惩模式 🎉',
                        '📝 梦女取消了切换 😢',
                        function(accepted){
                            if (!accepted) { renderRps(); return; }
                            rpsRole = nr; renderRps();
                        }
                    );
                    return;
                }
                rpsRole = nr; renderRps();
            });});
            document.querySelectorAll('#rpsModeTabs .tab').forEach(function(t){ t.addEventListener('click', function(){
                var nm = t.dataset.mode;
                if (nm === 'winner_rules' && rpsRole === 'angle') {
                    dreamerProposesSwitch(
                        '📝 梦女开启了双方奖惩模式 🎉',
                        '📝 梦女取消了切换 😢',
                        function(accepted){
                            if (!accepted) { renderRps(); return; }
                            rpsMode = nm; renderRps();
                        }
                    );
                    return;
                }
                rpsMode = nm; renderRps();
            });});
            document.querySelectorAll('#rpsModal .rps-actions .btn').forEach(function(b){ b.onclick = function(){ playRps(b.dataset.hand); }; });
            const rcB = document.getElementById('rpsClearBtn'); if (rcB) rcB.onclick = function(){ if (!confirm('清空猜拳历史？')) return; dreamGames.rps_history = []; dreamGames.rps_stats = {dreamerWins:0, angleWins:0, ties:0}; saveAppearance(); renderRps(); };
            const reB = document.getElementById('rpsExportBtn'); if (reB) reB.onclick = function(){
                const blob = new Blob([JSON.stringify({rps_history:dreamGames.rps_history, rps_stats:dreamGames.rps_stats}, null, 2)],{type:'application/json'});
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rps-history.json'; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); if (a.parentNode) a.parentNode.removeChild(a);}, 1000);
            };
            // Doodle
            const cdM = document.getElementById('closeDoodleModal');
            if (cdM) { cdM.onclick = function(){ closeModal(doodleModal); }; doodleModal.addEventListener('click', function(e){ if (e.target === doodleModal) closeModal(doodleModal); }); }
            // Draw Guess
            const cgM = document.getElementById('closeDrawGuessModal');
            if (cgM) { cgM.onclick = function(){ closeModal(drawGuessModal); }; drawGuessModal.addEventListener('click', function(e){ if (e.target === drawGuessModal) closeModal(drawGuessModal); }); }
            document.querySelectorAll('#dgRoleSwitch .chip').forEach(function(c){ c.addEventListener('click', function(){ dgRole = c.dataset.role; renderDg(); }); });
            document.querySelectorAll('#dgModeTabs .tab').forEach(function(t){ t.addEventListener('click', function(){
                var nm = t.dataset.mode;
                if (nm === 'free' && dgRole === 'angle' && dgMode !== 'free') {
                    dreamerProposesSwitch(
                        '📝 梦女开启了自由画你画我猜 ✨',
                        '📝 梦女取消了切换 😅',
                        function(accepted){
                            if (!accepted) { renderDg(); return; }
                            dgMode = nm; renderDg();
                        }
                    );
                    return;
                }
                dgMode = nm; renderDg();
            });});
            const sgB = document.getElementById('dgStartBtn'); if (sgB) sgB.onclick = startDgRound;
            const ggB = document.getElementById('dgGuessBtn'); if (ggB) ggB.onclick = dgGuess;
            const giI = document.getElementById('dgGuessInput'); if (giI) giI.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); dgGuess(); } });
            const tmB = document.getElementById('dgTopicMgrBtn'); if (tmB) tmB.onclick = function(){
                const w = document.getElementById('dgTopicMgrWrap'); w.dataset.open = (w.dataset.open === '1' ? '0' : '1'); renderDg();
            };
            // confirmModal 关闭
            if (confirmModal) confirmModal.addEventListener('click', function(e){ if (e.target === confirmModal) confirmModal.classList.remove('active'); });
        }

        init();
        updateAllOpacityDisplays();
        // 启动主动写信定时器（init 后 letterBox/letterBox.mine.inbox 已就绪）
        restartLetterTimer();
    })();
