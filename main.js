const puppeteer = require("puppeteer");

let scrape = async () => {
  const USER_NAME = "YOU-USERNAME",
    USER_PASSWORD = "YOU-PASSWORD",
    ME_LINK = `https://www.instagram.com/${USER_NAME}/`;

  const TIME_START = new Date(),
    HOUR_IN_DAY = 24,
    MINUTE_IN_HOUR = 60,
    SECOND_IN_MINUTE = 60,
    MILISECOND_IN_SECOND = 1000;

  const COUNT_USER = 50,
    COUNT_POST = 50,
    WIDTH_MONITOR = 1920,
    HEIGHT_MONITOR = 1080,
    WAIT_FOR_SELECTOR_TIMEOUT = 0,
    DELAY_PRINT_INPUT = 100,
    DELAY_UPDATE_NEW_POST_HASH_TAG = 2500,
    MAX_COUNT_FOLLOW_DAY = 150,
    INTERVAL_FOLLOW = (HOUR_IN_DAY * MINUTE_IN_HOUR * SECOND_IN_MINUTE * MILISECOND_IN_SECOND) / MAX_COUNT_FOLLOW_DAY;

  const LINKS_HASH_TAG = [
    "https://www.instagram.com/explore/tags/%D0%BD%D0%BE%D1%81%D0%BA%D0%B8%D0%BA%D0%B8%D0%B5%D0%B2/",
    "https://www.instagram.com/explore/tags/%D0%BD%D0%BE%D1%81%D0%BA%D0%B8%D1%83%D0%BA%D1%80%D0%B0%D0%B8%D0%BD%D0%B0/",
    "https://www.instagram.com/explore/tags/%D1%88%D0%BA%D0%B0%D1%80%D0%BF%D0%B5%D1%82%D0%BA%D0%B8%D0%BA%D0%B8%D1%97%D0%B2/",
  ];

  const $HASH_TAG_POST = ".eLAPa",
    $LOG_IN_NAME = "input[name=username]",
    $LOG_IN_PASSWORD = "input[name=password]",
    $LOG_IN_BUTTON_SUBMIT = "#loginForm button[type=submit]",
    $LOG_IN_BUTTON_AUTOSAVE = ".ABCxa button[type=button]",
    $AUTHOR_POST_HASH_TAG = ".e1e1d span a",
    $AUTHOR_COMMENT_POST_HASH_TAG = "h3 span a",
    $BUTTON_FOLLOW_USER = ".BY3EC button",
    $DOTS_USER_ACOUNT = "button.wpO6b svg",
    $ME_FOLLOWERS = `a[href="/${USER_NAME}/followers/"]`,
    $ME_FOLLOWINGS = `a[href="/${USER_NAME}/following/"]`,
    $ME_FOLLOWERS_COUNT = `${$ME_FOLLOWERS} span`,
    $ME_FOLLOWING_COUNT = `${$ME_FOLLOWINGS} span`,
    $ME_FOLLOWERS_LIST = "ul.jSC57._6xe7A",
    $ME_FOLLOWING_LIST = "ul.jSC57._6xe7A",
    $ME_FOLLOWER = `${$ME_FOLLOWERS_LIST} span a`,
    $ME_FOLLOWING = `${$ME_FOLLOWERS_LIST} span a`,
    $CLOSE_MODAL_FOLLOWERS = ".WaOAr .wpO6b",
    $BUTTON_MORE_COMMENT = ".dCJp8.afkep",
    $ME_FOLL_BOX = ".isgrP";

  let globalListMeFollowers = [],
    globalListMeFollowings = [],
    globalMeUser,
    globalCountUserFollow = 0;

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    ignoreDefaultArgs: ["--disable-extensions"],
  });

  const pageHashTag = await browser.newPage();
  await pageHashTag.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });
  await pageHashTag.goto(LINKS_HASH_TAG[0]);

  await pageHashTag.waitForSelector($HASH_TAG_POST, { timeout: WAIT_FOR_SELECTOR_TIMEOUT });

  await pageHashTag.click($HASH_TAG_POST);

  await pageHashTag.type($LOG_IN_NAME, USER_NAME, { delay: DELAY_PRINT_INPUT });
  await pageHashTag.type($LOG_IN_PASSWORD, USER_PASSWORD, { delay: DELAY_PRINT_INPUT });

  await pageHashTag.click($LOG_IN_BUTTON_SUBMIT);

  await pageHashTag.waitForSelector($LOG_IN_BUTTON_AUTOSAVE, { timeout: WAIT_FOR_SELECTOR_TIMEOUT });

  await pageHashTag.click($LOG_IN_BUTTON_AUTOSAVE);

  await pageHashTag.waitForSelector($HASH_TAG_POST, { timeout: WAIT_FOR_SELECTOR_TIMEOUT });

  async function searchUserCommentHashTag(lobalIndexArrQuery, globalFirstSunset) {
    // ME ACOUNT

    const pageMe = await browser.newPage();
    await pageMe.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });
    await pageMe.goto(ME_LINK);

    async function countingUserMePage(__meFollowers, __meFollowersCount, __meFollowersList, __meFollower) {
      await pageMe.waitForSelector(__meFollowers);

      let count = await pageMe.$eval(__meFollowersCount, (countUsers) => {
        return countUsers.textContent;
      });
      console.log("Me foll: " + count);

      await pageMe.click(__meFollowers);

      await pageMe.waitForSelector(__meFollowersList);

      async function scrollToBottom() {
        await pageMe.$eval(__meFollowersList, (list) => {
          list.closest(".isgrP").scrollTop = list.scrollHeight;
        });
        await pageMe.waitForTimeout(1000);
        const lengthList = await pageMe.$$eval(__meFollower, (user) => {
          return user.length;
        });
        lengthList !== +count && (await scrollToBottom());
      }

      await scrollToBottom();

      let list = await pageMe.$$eval(__meFollower, (users) => {
        return users.map((user) => {
          return user.href;
        });
      });
      return list;
    }

    globalListMeFollowers = await countingUserMePage($ME_FOLLOWERS, $ME_FOLLOWERS_COUNT, $ME_FOLLOWERS_LIST, $ME_FOLLOWER);

    await pageMe.click($CLOSE_MODAL_FOLLOWERS);

    globalListMeFollowings = await countingUserMePage($ME_FOLLOWINGS, $ME_FOLLOWING_COUNT, $ME_FOLLOWING_LIST, $ME_FOLLOWING);

    globalMeUser = globalListMeFollowers.concat(globalListMeFollowings);

    await pageMe.close();

    // /ME ACCOUNT

    const listPost = [];
    async function createListPost(indexArrQuery, firstSunset) {
      firstSunset && (await pageHashTag.goto(LINKS_HASH_TAG[indexArrQuery]));

      await pageHashTag.waitForSelector($HASH_TAG_POST, { timeout: WAIT_FOR_SELECTOR_TIMEOUT });

      const postsHrefList = await pageHashTag.$$eval($HASH_TAG_POST, (listSelector) => {
        return listSelector.map((post, index) => {
          if (index + 1 === listSelector.length) {
            return post.closest("a").href;
          } else {
            let postUrl = post.closest("a").href;
            post.remove();
            return postUrl;
          }
        });
      });
      for (const postUrl of postsHrefList) {
        listPost.push(postUrl);
      }
      await pageHashTag.waitForTimeout(DELAY_UPDATE_NEW_POST_HASH_TAG);
      await pageHashTag.$$eval($HASH_TAG_POST, (selectorPost) => {
        selectorPost.length === 1 && window.scrollTo(0, document.body.scrollHeight);
        selectorPost[0].remove();
      });
      await pageHashTag.waitForTimeout(DELAY_UPDATE_NEW_POST_HASH_TAG);
      listPost.length <= COUNT_POST && (await createListPost(indexArrQuery, false));
    }
    await createListPost(lobalIndexArrQuery, globalFirstSunset);

    const listUser = [];

    async function createListUser() {
      const pageHashTagPost = await browser.newPage();
      await pageHashTagPost.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });
      for (const post of listPost) {
        if (listUser.length < COUNT_USER) {
          console.log(listUser.length);
          await pageHashTagPost.goto(post);
          await pageHashTagPost.waitForSelector($AUTHOR_POST_HASH_TAG, { timeout: WAIT_FOR_SELECTOR_TIMEOUT });

          async function clickButtonMoreComment() {
            await pageHashTagPost.click($BUTTON_MORE_COMMENT);
            await pageHashTagPost.waitForTimeout(1000);
            (await pageHashTagPost.$($BUTTON_MORE_COMMENT)) && (await clickButtonMoreComment());
          }
          (await pageHashTagPost.$($BUTTON_MORE_COMMENT)) && (await clickButtonMoreComment());

          const authorPostTag = await pageHashTagPost.$eval($AUTHOR_POST_HASH_TAG, (authorPost) => {
            return authorPost.href;
          });
          const listLinkUserComent = await pageHashTagPost.$$eval($AUTHOR_COMMENT_POST_HASH_TAG, (selectorPost) => {
            return selectorPost.map((user) => {
              return user.href;
            });
          });
          for (const link of listLinkUserComent) {
            authorPostTag !== link && !globalMeUser.includes(link) && !listUser.includes(link) && listUser.push(link);
          }
        } else break;
      }
      await pageHashTagPost.close();
    }
    await createListUser();

    async function followUser() {
      const pageUser = await browser.newPage();
      await pageUser.setViewport({ width: WIDTH_MONITOR, height: HEIGHT_MONITOR });
      for (const user of listUser) {
        await pageUser.goto(user);

        await pageUser.waitForSelector($DOTS_USER_ACOUNT, { timeout: WAIT_FOR_SELECTOR_TIMEOUT });

        const textButton = await pageUser.$eval($BUTTON_FOLLOW_USER, (button) => {
          return button.textContent;
        });
        console.log(textButton);
        globalCountUserFollow < COUNT_USER &&
          (await pageUser.$($BUTTON_FOLLOW_USER)) &&
          textButton !== "Запрос отправлен" &&
          (await pageUser.click($BUTTON_FOLLOW_USER),
          console.log("folow " + user),
          globalCountUserFollow++,
          console.log("wait for: " + INTERVAL_FOLLOW),
          await pageUser.waitForTimeout(INTERVAL_FOLLOW));
        console.log("follower: " + globalCountUserFollow);
        if (globalCountUserFollow >= COUNT_USER) break;
      }
      pageUser.close();
    }
    await followUser();

    globalCountUserFollow < COUNT_USER && (await searchUserCommentHashTag(++lobalIndexArrQuery, true));
  }

  await searchUserCommentHashTag(0, false);

  return "Today = finish";
};

scrape().then((value) => {
  console.log(value);
});
