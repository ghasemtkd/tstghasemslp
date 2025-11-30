const { Telegraf, Markup } = require('telegraf');

// استفاده از حافظه موقت به جای MongoDB برای سادگی
const BOT_TOKEN = '8345777485:AAHEQJLI-uGaTmmZXIcwT-MvWp_nEd6kDLQ';
const bot = new Telegraf(BOT_TOKEN);

// کانال مورد نظر برای چک کردن عضویت
const REQUIRED_CHANNEL = '@gaiorg'; // ایدی کانال شما

// ذخیره‌سازی ساده در memory
const groups = new Map();
const users = new Map();
const howls = new Map();
const userTitles = new Map(); // ذخیره لقب‌های کاربران

// سیستم سطح‌بندی
const LEVEL_SYSTEM = {
    1: { name: 'عضو گله', bloodRequired: 0 },
    2: { name: 'گرگ جوان', bloodRequired: 30 },
    3: { name: 'گرگ جنگجو', bloodRequired: 70 },
    4: { name: 'گرگ کهنه‌کار', bloodRequired: 120 },
    5: { name: 'گرگ افسانه‌ای', bloodRequired: 200 }
};

// سیستم رتبه‌بندی در گروه
const RANK_SYSTEM = {
    1: { name: 'الفا 🐺', emoji: '👑' },
    2: { name: 'وزیر 🦊', emoji: '🎭' },
    3: { name: 'دکتر تسخیر شده', emoji: '⚕️' },
    4: { name: 'دکتر تسخیر شده', emoji: '⚕️' },
    5: { name: 'گرگینه', emoji: '🐺' },
    6: { name: 'گرگینه', emoji: '🐺' },
    7: { name: 'گرگینه', emoji: '🐺' },
    8: { name: 'یگان جنگل', emoji: '⚔️' },
    9: { name: 'یگان جنگل', emoji: '⚔️' },
    10: { name: 'یگان جنگل', emoji: '⚔️' },
    11: { name: 'یگان جنگل', emoji: '⚔️' },
    12: { name: 'یگان جنگل', emoji: '⚔️' },
    13: { name: 'یگان جنگل', emoji: '⚔️' },
    14: { name: 'یگان دفاعی', emoji: '🛡️' }
};

// تابع چک کردن عضویت کاربر در کانال
async function checkChannelMembership(ctx) {
    try {
        // چک کردن عضویت کاربر در کانال
        const chatMember = await ctx.telegram.getChatMember(REQUIRED_CHANNEL, ctx.from.id);
        
        // اگر کاربر عضو کانال است یا سازنده/ادمین آن است
        if (['member', 'administrator', 'creator'].includes(chatMember.status)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('خطا در چک کردن عضویت:', error);
        // در صورت خطا، اجازه بده ادامه دهد تا کاربر блок نشود
        return true;
    }
}

// تابع انیمیشن چک کردن عضویت
async function playMembershipAnimation(ctx, messageId) {
    const fingers = ['👎', '👎', '👎', '👎'];
    const loadingMessages = [
        "🐺 در حال بررسی عضویت گرگینه...",
        "🔍 چک کردن وضعیت گله مادر...",
        "📡 اتصال به سرور گرگ‌ها...",
        "🎯 بررسی وفاداری گرگینه..."
    ];
    
    let currentMessageIndex = 0;
    
    // شروع انیمیشن با انگشتان اولیه
    let animationMessage = await ctx.editMessageText(
        `🔍 **بررسی عضویت در گله مادر**\n\n` +
        `${fingers.join('')}\n\n` +
        `${loadingMessages[currentMessageIndex]}`,
        { parse_mode: 'HTML' }
    );
    
    // انیمیشن تبدیل انگشتان
    for (let i = 0; i < fingers.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // تبدیل به لایک
        fingers[i] = '👍';
        currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
        
        await ctx.editMessageText(
            `🔍 **بررسی عضویت در گله مادر**\n\n` +
            `${fingers.join('')}\n\n` +
            `${loadingMessages[currentMessageIndex]}`,
            { parse_mode: 'HTML' }
        );
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // تبدیل به دیس لایک
        fingers[i] = '👎';
        currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
        
        await ctx.editMessageText(
            `🔍 **بررسی عضویت در گله مادر**\n\n` +
            `${fingers.join('')}\n\n` +
            `${loadingMessages[currentMessageIndex]}`,
            { parse_mode: 'HTML' }
        );
        
        // چک کردن عضویت بعد از هر انگشت
        const isMember = await checkChannelMembership(ctx);
        if (isMember) {
            // کاربر عضو شده - تبدیل همه به لایک
            for (let j = i + 1; j < fingers.length; j++) {
                fingers[j] = '👍';
            }
            
            await ctx.editMessageText(
                `🎉 **تبریک! گرگینه تایید مادر شد!**\n\n` +
                `${fingers.join('')}\n\n` +
                `✅ شما با موفقیت عضو گله مادر شدید!\n` +
                `🐺 حالا می‌تونی از تمام قابلیت‌های ربات استفاده کنی!`,
                { parse_mode: 'HTML' }
            );
            
            return true;
        }
    }
    
    // اگر کاربر تا انتها عضو نشده بود
    return false;
}

// تابع ارسال پیام عضویت
async function sendMembershipMessage(ctx) {
    const message = `🐺 **عزیزم از گله مادر دور شدی!**\n\n` +
                  `برای تعامل با ربات گرگینه، باید عضو کانال گله مادر بشی:\n` +
                  `${REQUIRED_CHANNEL}\n\n` +
                  `بعد از عضویت، دوباره امتحان کن!`;
    
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.url('🎯 عضویت در گله مادر', `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`)],
        [Markup.button.callback('✅ بررسی مجدد عضویت', 'check_membership')]
    ]);
    
    // اگر پیام ریپلای شده باشد، از ریپلای استفاده می‌کنیم
    if (ctx.message && ctx.message.message_id) {
        await ctx.replyWithHTML(message, {
            ...keyboard,
            reply_to_message_id: ctx.message.message_id
        });
    } else {
        await ctx.replyWithHTML(message, keyboard);
    }
}

// هندلر برای دکمه بررسی مجدد عضویت
bot.action('check_membership', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        
        // پخش انیمیشن چک کردن عضویت
        const isMember = await playMembershipAnimation(ctx, ctx.callbackQuery.message.message_id);
        
        if (isMember) {
            // کاربر عضو شده
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await ctx.editMessageText(
                `✅ **عالی! شما عضو گله مادر هستید!**\n\n` +
                `🐺 **دستورات اصلی:**\n` +
                `/start - شروع کار با ربات\n` +
                `عوو - زوزه کشیدن\n` +
                `آمار من - مشاهده آمار شخصی\n` +
                `جنگل امنه - آمار گروه\n\n` +
                `حالا می‌تونی از تمام قابلیت‌های ربات گرگینه استفاده کنی!`,
                { parse_mode: 'HTML' }
            );
        } else {
            // کاربر هنوز عضو نشده
            await ctx.editMessageText(
                `❌ **شما هنوز عضو گله مادر نشده‌اید!**\n\n` +
                `برای استفاده از ربات گرگینه، باید در کانال زیر عضو بشید:\n` +
                `${REQUIRED_CHANNEL}\n\n` +
                `بعد از عضویت، دوباره امتحان کن!`,
                {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                        [Markup.button.url('🎯 عضویت در گله مادر', `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`)],
                        [Markup.button.callback('🔄 بررسی مجدد', 'check_membership')]
                    ])
                }
            );
        }
    } catch (error) {
        console.error('خطا در بررسی مجدد عضویت:', error);
        await ctx.answerCbQuery('❌ خطا در بررسی عضویت!');
    }
});

// تابع محاسبه سطح کاربر
function calculateUserLevel(totalBlood) {
    let level = 1;
    let nextLevelBlood = LEVEL_SYSTEM[2].bloodRequired;
    
    for (let i = 2; i <= 5; i++) {
        if (totalBlood >= LEVEL_SYSTEM[i].bloodRequired) {
            level = i;
            nextLevelBlood = LEVEL_SYSTEM[i + 1] ? LEVEL_SYSTEM[i + 1].bloodRequired : null;
        } else {
            nextLevelBlood = LEVEL_SYSTEM[i].bloodRequired;
            break;
        }
    }
    
    return {
        level,
        levelName: LEVEL_SYSTEM[level].name,
        currentBlood: totalBlood,
        nextLevelBlood: nextLevelBlood,
        bloodToNextLevel: nextLevelBlood ? nextLevelBlood - totalBlood : 0,
        progress: nextLevelBlood ? Math.min((totalBlood / nextLevelBlood) * 100, 100) : 100
    };
}

// تابع محاسبه رتبه در گروه
function calculateGroupRank(userIndex) {
    const rankNumber = userIndex + 1;
    return RANK_SYSTEM[rankNumber] || RANK_SYSTEM[14];
}

// تابع ایجاد نمودار پیشرفت
function createProgressBar(progress, length = 10) {
    const filled = Math.round((progress / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

// تابع دریافت نام کاربر (با درنظرگیری لقب)
function getUserDisplayName(userId, groupId, firstName) {
    const titleKey = `${userId}_${groupId}`;
    const userTitle = userTitles.get(titleKey);
    return userTitle ? userTitle : firstName;
}

// دستور start با دکمه شیشه‌ای
bot.start(async (ctx) => {
    // چک کردن عضویت کاربر
    const isMember = await checkChannelMembership(ctx);
    
    if (!isMember) {
        await sendMembershipMessage(ctx);
        return;
    }
    
    const welcomeText = `🐺 **گرگینه بیدار شو!**\n\nبه ربات گرگینه خوش آمدید! برای شروع ماجراجویی، ربات را به گروه خود اضافه کنید.`;
    
    const glassButton = Markup.inlineKeyboard([
        [Markup.button.url('🎯 سلام علیک برای افزودن به گروه', `https://t.me/${ctx.botInfo.username}?startgroup=true`)],
        [Markup.button.callback('📋 راهنما', 'help')]
    ]);
    
    await ctx.replyWithHTML(welcomeText, glassButton);
});

// دستور help
bot.action('help', async (ctx) => {
    const helpText = `🐺 **راهنمای ربات گرگینه:**\n\n` +
        `• برای شروع: ربات را به گروه اضافه کنید\n` +
        `• فرمان بیداری: در گروه بنویسید "گرگینه بیدار شه"\n` +
        `• زوزه کشیدن: بنویسید "عوو" یا "عوووو"\n` +
        `• جنگل امن: بنویسید "جنگل امنه"\n` +
        `• آمار من: بنویسید "آمار من"\n\n` +
        `⏰ فاصله بین زوزه‌ها: 3 ساعت\n` +
        `🩸 امتیاز هر زوزه: 5 لیتر خون\n\n` +
        `👑 **دستورات مدیریتی:**\n` +
        `• ریپلای روی کاربر + "لقب گرگ ترسو" - ثبت لقب\n` +
        `• ریپلای روی کاربر + "حذف لقب" - حذف لقب\n\n` +
        `📢 **شرایط استفاده:**\n` +
        `• عضویت در کانال ${REQUIRED_CHANNEL} الزامی است`;
    
    await ctx.editMessageText(helpText, Markup.inlineKeyboard([
        [Markup.button.callback('🏠 برگشت', 'back_to_start')]
    ]));
});

bot.action('back_to_start', async (ctx) => {
    const welcomeText = `🐺 **گرگینه بیدار شو!**\n\nبه ربات گرگینه خوش آمدید! برای شروع ماجراجویی، ربات را به گروه خود اضافه کنید.`;
    
    const glassButton = Markup.inlineKeyboard([
        [Markup.button.url('🎯 سلام علیک برای افزودن به گروه', `https://t.me/${ctx.botInfo.username}?startgroup=true`)],
        [Markup.button.callback('📋 راهنما', 'help')]
    ]);
    
    await ctx.editMessageText(welcomeText, glassButton);
});

// مدیریت وقتی ربات به گروه اضافه می‌شود
bot.on('new_chat_members', async (ctx) => {
    const botId = ctx.botInfo.id;
    const newMembers = ctx.message.new_chat_members;
    
    if (newMembers.some(member => member.id === botId)) {
        const groupId = ctx.chat.id;
        const groupTitle = ctx.chat.title;
        
        // ذخیره گروه
        groups.set(groupId, {
            groupId: groupId,
            groupTitle: groupTitle,
            isActive: false,
            addedAt: new Date()
        });
        
        await ctx.replyWithHTML(
            `🐺 **گرگینه به گروه "${groupTitle}" پیوست!**\n\n` +
            `برای فعال‌سازی ربات، در گروه بنویسید:\n` +
            `<code>گرگینه بیدار شه</code>\n\n` +
            `📢 **توجه:** همه کاربران باید عضو کانال ${REQUIRED_CHANNEL} باشند!`
        );
    }
});

// فعال‌سازی ربات در گروه
bot.hears('گرگینه بیدار شه', async (ctx) => {
    if (ctx.chat.type === 'private') return;
    
    // چک کردن عضویت قبل از پردازش دستور
    const isMember = await checkChannelMembership(ctx);
    if (!isMember) {
        await sendMembershipMessage(ctx);
        return;
    }
    
    const groupId = ctx.chat.id;
    const group = groups.get(groupId);
    
    if (!group) {
        await ctx.reply('❌ ابتدا ربات را به گروه اضافه کنید!');
        return;
    }
    
    if (group.isActive) {
        await ctx.reply('🐺 گرگینه قبلاً در این گروه بیدار شده است!');
        return;
    }
    
    // فعال‌سازی گروه
    group.isActive = true;
    group.activatedAt = new Date();
    groups.set(groupId, group);
    
    await ctx.replyWithHTML(
        `🐺 **گرگینه بیدار شد!**\n\n` +
        `از این لحظه، گرگینه در این گروه فعال است.\n\n` +
        `📝 دستورات:\n` +
        `• زوزه: "عوو" یا "عوووو"\n` +
        `• اطلاعات: "جنگل امنه"\n` +
        `• آمار: "آمار من"\n\n` +
        `⏰ فاصله زوزه‌ها: 3 ساعت\n` +
        `🩸 امتیاز هر زوزه: 5 لیتر خون\n\n` +
        `📢 **شرایط استفاده:**\n` +
        `• همه کاربران باید عضو کانال ${REQUIRED_CHANNEL} باشند`
    );
});

// تشخیص زوزه - با چک کردن عضویت
bot.hears(/عو{2,}/i, async (ctx) => {
    if (ctx.chat.type === 'private') return;
    
    // چک کردن عضویت قبل از پردازش زوزه
    const isMember = await checkChannelMembership(ctx);
    if (!isMember) {
        await sendMembershipMessage(ctx);
        return;
    }
    
    const groupId = ctx.chat.id;
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    
    // بررسی فعال بودن گروه
    const group = groups.get(groupId);
    if (!group || !group.isActive) return;
    
    const now = new Date();
    const userKey = `${userId}_${groupId}`;
    
    // بررسی آخرین زوزه کاربر
    const lastHowl = howls.get(userKey);
    if (lastHowl) {
        const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        if (lastHowl > threeHoursAgo) {
            const nextHowlTime = new Date(lastHowl.getTime() + 3 * 60 * 60 * 1000);
            const remainingTime = nextHowlTime - now;
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            
            await ctx.replyWithHTML(
                `🐺 گرگینه عزیز!\n\n` +
                `⏳ تا زوزه بعدی ${hours} ساعت و ${minutes} دقیقه مانده.\n` +
                `لطفا صبر پیشه کنید!`,
                { reply_to_message_id: ctx.message.message_id }
            );
            return;
        }
    }
    
    // ثبت زوزه جدید
    howls.set(userKey, now);
    
    // به‌روزرسانی امتیاز کاربر
    const userData = users.get(userKey) || {
        userId: userId,
        groupId: groupId,
        username: username,
        firstName: ctx.from.first_name,
        firstHowl: now,
        totalBlood: 0,
        totalHowls: 0
    };
    userData.totalBlood += 5;
    userData.totalHowls += 1;
    userData.lastHowl = now;
    users.set(userKey, userData);
    
    // محاسبه سطح جدید
    const levelInfo = calculateUserLevel(userData.totalBlood);
    
    await ctx.replyWithHTML(
        `🐺 <b>${username}</b> زوزه شما تایید شد!\n` +
        `مثل یک گرگ بیدار باشید و مثل یک گرگ وفادار و شجاع بمونید.\n\n` +
        `🩸 +5 لیتر خون دریافت کردید!\n` +
        `📊 مجموع خون: ${userData.totalBlood} لیتر\n` +
        `🏆 سطح فعلی: ${levelInfo.level} - ${levelInfo.levelName}`,
        { reply_to_message_id: ctx.message.message_id }
    );
});

// دستور جنگل امن - آمار گروه (با چک کردن عضویت)
bot.hears('جنگل امنه', async (ctx) => {
    if (ctx.chat.type === 'private') return;
    
    // چک کردن عضویت قبل از پردازش دستور
    const isMember = await checkChannelMembership(ctx);
    if (!isMember) {
        await sendMembershipMessage(ctx);
        return;
    }
    
    const groupId = ctx.chat.id;
    const userId = ctx.from.id;
    const userKey = `${userId}_${groupId}`;
    
    const group = groups.get(groupId);
    if (!group || !group.isActive) return;
    
    const userData = users.get(userKey);
    if (!userData) {
        await ctx.replyWithHTML(
            `❌ شما هنوز در این گله گرگ‌ها زوزه‌ای نکشیده‌اید!\n` +
            `برای شروع، "عوو" بنویسید!`,
            { reply_to_message_id: ctx.message.message_id }
        );
        return;
    }
    
    // محاسبه سطح و رتبه
    const levelInfo = calculateUserLevel(userData.totalBlood);
    
    // پیدا کردن رتبه کاربر در گروه
    const groupUsers = [];
    for (let [key, user] of users) {
        if (key.endsWith(`_${groupId}`)) {
            groupUsers.push(user);
        }
    }
    groupUsers.sort((a, b) => b.totalBlood - a.totalBlood);
    const userRank = groupUsers.findIndex(user => user.userId === userId) + 1;
    const rankInfo = calculateGroupRank(userRank - 1);
    
    const joinDate = userData.firstHowl;
    const persianDate = joinDate.toLocaleDateString('fa-IR');
    const displayName = getUserDisplayName(userId, groupId, ctx.from.first_name);
    
    // ایجاد متن آمار
    let statsText = `🐺 <b>آمار شخصی گرگینه</b>\n\n`;
    statsText += `👤 <b>${displayName}</b>\n`;
    statsText += `📅 عضویت: ${persianDate}\n\n`;
    
    statsText += `🏆 <b>سطح: ${levelInfo.level} - ${levelInfo.levelName}</b>\n`;
    statsText += `👑 <b>رتبه در گله: ${userRank} - ${rankInfo.name} ${rankInfo.emoji}</b>\n\n`;
    
    statsText += `📊 <b>آمار خون:</b>\n`;
    statsText += `🩸 خون جمع‌آوری شده: <b>${userData.totalBlood} لیتر</b>\n`;
    statsText += `📞 تعداد زوزه‌ها: <b>${userData.totalHowls} بار</b>\n\n`;
    
    if (levelInfo.nextLevelBlood) {
        statsText += `🎯 <b>پیشرفت به سطح بعدی:</b>\n`;
        statsText += `📈 ${createProgressBar(levelInfo.progress)} ${Math.round(levelInfo.progress)}%\n`;
        statsText += `🩸 ${levelInfo.bloodToNextLevel} لیتر خون تا سطح ${levelInfo.level + 1}\n`;
        statsText += `📞 ${Math.ceil(levelInfo.bloodToNextLevel / 5)} زوزه باقی مانده\n`;
    } else {
        statsText += `🎉 <b>شما به بالاترین سطح رسیده‌اید!</b>\n`;
        statsText += `👑 شما یک گرگ افسانه‌ای هستید!`;
    }
    
    // اضافه کردن دکمه برای نمایش آمار کامل
    const showFullStatsButton = Markup.inlineKeyboard([
        [Markup.button.callback('📊 نمایش آمار کامل گله', 'show_full_stats')]
    ]);
    
    await ctx.replyWithHTML(statsText, {
        reply_to_message_id: ctx.message.message_id,
        ...showFullStatsButton
    });
});

// نمایش آمار کامل گله (با دکمه)
bot.action('show_full_stats', async (ctx) => {
    const groupId = ctx.chat.id;
    const userId = ctx.from.id;
    const group = groups.get(groupId);
    
    if (!group || !group.isActive) return;
    
    // جمع‌آوری کاربران این گروه
    const groupUsers = [];
    for (let [key, user] of users) {
        if (key.endsWith(`_${groupId}`)) {
            groupUsers.push(user);
        }
    }
    
    // مرتب‌سازی بر اساس خون جمع‌آوری شده
    groupUsers.sort((a, b) => b.totalBlood - a.totalBlood);
    
    // پیدا کردن رتبه کاربر فعلی
    const currentUserIndex = groupUsers.findIndex(user => user.userId === userId);
    const currentUserRank = currentUserIndex + 1;
    const currentRankInfo = calculateGroupRank(currentUserIndex);
    
    let statsText = `🐺 <b>${group.groupTitle}</b>\n`;
    
    // نمایش اطلاعات کاربر فعلی
    if (currentUserIndex !== -1) {
        statsText += `👑 رتبه شما در گله: ${currentUserRank} - ${currentRankInfo.name} ${currentRankInfo.emoji}\n`;
    }
    
    // نمایش 5 کاربر برتر
    if (groupUsers.length > 0) {
        statsText += `👑 <b>گرگ‌های برتر گله:</b>\n`;
        
        for (let i = 0; i < Math.min(5, groupUsers.length); i++) {
            const user = groupUsers[i];
            const rank = calculateGroupRank(i);
            const levelInfo = calculateUserLevel(user.totalBlood);
            const displayName = getUserDisplayName(user.userId, groupId, user.firstName);
            
            statsText += `\n${rank.emoji} <b>${i + 1}.</b> ${displayName}\n`;
            statsText += `   🩸 ${user.totalBlood} لیتر | ${levelInfo.levelName}\n`;
            statsText += `   📞 ${user.totalHowls} زوزه | ${rank.name}\n`;
        }
        
        statsText += `\n📊 <b>آمار گله:</b>\n`;
        statsText += `• تعداد گرگ‌ها: ${groupUsers.length}\n`;
        statsText += `• مجموع خون جمع‌آوری شده: ${groupUsers.reduce((sum, user) => sum + user.totalBlood, 0)} لیتر\n`;
        statsText += `• مجموع زوزه‌ها: ${groupUsers.reduce((sum, user) => sum + user.totalHowls, 0)} بار\n`;
    } else {
        statsText += `❌ هنوز هیچ گرگی در این گله زوزه‌ای نکشیده است!\n`;
        statsText += `برای شروع، "عوو" بنویسید!`;
    }
    
    await ctx.editMessageText(statsText, { 
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🔙 بازگشت به آمار شخصی', 'back_to_personal_stats')]
        ])
    });
});

// بازگشت به آمار شخصی
bot.action('back_to_personal_stats', async (ctx) => {
    const groupId = ctx.chat.id;
    const userId = ctx.from.id;
    const userKey = `${userId}_${groupId}`;
    
    const group = groups.get(groupId);
    if (!group || !group.isActive) return;
    
    const userData = users.get(userKey);
    if (!userData) {
        await ctx.replyWithHTML(
            `❌ شما هنوز در این گله گرگ‌ها زوزه‌ای نکشیده‌اید!\n` +
            `برای شروع، "عوو" بنویسید!`,
            { reply_to_message_id: ctx.message.message_id }
        );
        return;
    }
    
    // محاسبه سطح و رتبه
    const levelInfo = calculateUserLevel(userData.totalBlood);
    
    // پیدا کردن رتبه کاربر در گروه
    const groupUsers = [];
    for (let [key, user] of users) {
        if (key.endsWith(`_${groupId}`)) {
            groupUsers.push(user);
        }
    }
    groupUsers.sort((a, b) => b.totalBlood - a.totalBlood);
    const userRank = groupUsers.findIndex(user => user.userId === userId) + 1;
    const rankInfo = calculateGroupRank(userRank - 1);
    
    const joinDate = userData.firstHowl;
    const persianDate = joinDate.toLocaleDateString('fa-IR');
    const displayName = getUserDisplayName(userId, groupId, ctx.from.first_name);
    
    // ایجاد متن آمار
    let statsText = `🐺 <b>آمار شخصی گرگینه</b>\n\n`;
    statsText += `👤 <b>${displayName}</b>\n`;
    statsText += `📅 عضویت: ${persianDate}\n\n`;
    
    statsText += `🏆 <b>سطح: ${levelInfo.level} - ${levelInfo.levelName}</b>\n`;
    statsText += `👑 <b>رتبه در گله: ${userRank} - ${rankInfo.name} ${rankInfo.emoji}</b>\n\n`;
    
    statsText += `📊 <b>آمار خون:</b>\n`;
    statsText += `🩸 خون جمع‌آوری شده: <b>${userData.totalBlood} لیتر</b>\n`;
    statsText += `📞 تعداد زوزه‌ها: <b>${userData.totalHowls} بار</b>\n\n`;
    
    if (levelInfo.nextLevelBlood) {
        statsText += `🎯 <b>پیشرفت به سطح بعدی:</b>\n`;
        statsText += `📈 ${createProgressBar(levelInfo.progress)} ${Math.round(levelInfo.progress)}%\n`;
        statsText += `🩸 ${levelInfo.bloodToNextLevel} لیتر خون تا سطح ${levelInfo.level + 1}\n`;
        statsText += `📞 ${Math.ceil(levelInfo.bloodToNextLevel / 5)} زوزه باقی مانده\n`;
    } else {
        statsText += `🎉 <b>شما به بالاترین سطح رسیده‌اید!</b>\n`;
        statsText += `👑 شما یک گرگ افسانه‌ای هستید!`;
    }
    
    // اضافه کردن دکمه برای نمایش آمار کامل
    const showFullStatsButton = Markup.inlineKeyboard([
        [Markup.button.callback('📊 نمایش آمار کامل گله', 'show_full_stats')]
    ]);
    
    await ctx.replyWithHTML(statsText, {
        reply_to_message_id: ctx.message.message_id,
        ...showFullStatsButton
    });
});

// سیستم لقب‌دهی برای ادمین‌ها
bot.on('text', async (ctx) => {
    if (ctx.chat.type === 'private') return;
    if (!ctx.message.reply_to_message) return;
    
    const groupId = ctx.chat.id;
    const adminId = ctx.from.id;
    const targetUserId = ctx.message.reply_to_message.from.id;
    const targetUserKey = `${targetUserId}_${groupId}`;
    const messageText = ctx.message.text;
    
    // بررسی اینکه کاربر ادمین است یا نه
    try {
        const chatMember = await ctx.getChatMember(adminId);
        const isAdmin = ['administrator', 'creator'].includes(chatMember.status);
        
        if (!isAdmin) return;
        
        // بررسی دستور لقب
        if (messageText.includes('لقب گرگ ترسو')) {
            userTitles.set(targetUserKey, 'گرگ ترسو');
            await ctx.replyWithHTML(
                `✅ لقب <b>"گرگ ترسو"</b> برای کاربر <b>${ctx.message.reply_to_message.from.first_name}</b> ثبت شد!\n` +
                `از این پس در آمارها با این لقب نمایش داده خواهد شد.`,
                { reply_to_message_id: ctx.message.message_id }
            );
        }
        
        // بررسی دستور حذف لقب
        else if (messageText.includes('حذف لقب')) {
            if (userTitles.has(targetUserKey)) {
                userTitles.delete(targetUserKey);
                await ctx.replyWithHTML(
                    `✅ لقب کاربر <b>${ctx.message.reply_to_message.from.first_name}</b> حذف شد!\n` +
                    `از این پس در آمارها با نام اصلی نمایش داده خواهد شد.`,
                    { reply_to_message_id: ctx.message.message_id }
                );
            } else {
                await ctx.replyWithHTML(
                    `❌ این کاربر هیچ لقبی ندارد!`,
                    { reply_to_message_id: ctx.message.message_id }
                );
            }
        }
        
        // سیستم لقب‌دهی پویا - اگر با "لقب" شروع شود
        else if (messageText.startsWith('لقب ')) {
            const title = messageText.replace('لقب ', '').trim();
            if (title.length > 0) {
                userTitles.set(targetUserKey, title);
                await ctx.replyWithHTML(
                    `✅ لقب <b>"${title}"</b> برای کاربر <b>${ctx.message.reply_to_message.from.first_name}</b> ثبت شد!\n` +
                    `از این پس در آمارها با این لقب نمایش داده خواهد شد.`,
                    { reply_to_message_id: ctx.message.message_id }
                );
            }
        }
        
    } catch (error) {
        console.error('خطا در بررسی وضعیت ادمین:', error);
    }
});

// مدیریت خطاها
bot.catch((err, ctx) => {
    console.error('خطا در ربات:', err);
});

// راه‌اندازی ربات
bot.launch().then(() => {
    console.log('🤖 ربات گرگینه فعال شد!');
    console.log(`📢 ربات برای کانال ${REQUIRED_CHANNEL} تنظیم شد`);
});

// مدیریت خروج
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
