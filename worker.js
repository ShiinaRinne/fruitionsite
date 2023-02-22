/* CONFIGURATION STARTS HERE */

/* Step 1: enter your domain name like fruitionsite.com */
  const MY_DOMAIN = 'blog.youngmoe.com';
  const MY_NOTION_DOMAIN = 'shiinarinne.notion.site'

/*
 * Step 2: enter your URL slug to page ID mapping
 * The key on the left is the slug (without the slash)
 * The value on the right is the Notion page ID
 */
const SLUG_TO_PAGE = {
    '': '76a9ec889ed94f5e9941cd57cbf5f1f6',
};

/* Step 3: enter your page title and description for SEO purposes */
  const PAGE_TITLE = "ym's blog";
  const PAGE_DESCRIPTION = ".";

/* Step 4: enter a Google Font name, you can choose from https://fonts.google.com */
  const GOOGLE_FONT = '';

/* Step 5: enter any custom scripts you'd like */
const CUSTOM_SCRIPT = ``;

/* CONFIGURATION ENDS HERE */

const PAGE_TO_SLUG = {};
const slugs = [];
const pages = [];
Object.keys(SLUG_TO_PAGE).forEach(slug => {
  const page = SLUG_TO_PAGE[slug];
  slugs.push(slug);
  pages.push(page);
  PAGE_TO_SLUG[page] = slug;
});

addEventListener("fetch", event => {
  event.respondWith(fetchAndApply(event.request));
});

function generateSitemap() {
  let sitemap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  slugs.forEach(
    (slug) =>
      (sitemap +=
        "<url><loc>https://" + MY_DOMAIN + "/" + slug + "</loc></url>")
  );
  sitemap += "</urlset>";
  return sitemap;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function handleOptions(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, PUT, OPTIONS"
      }
    });
  }
}

async function fetchAndApply(request) {
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }
  let url = new URL(request.url);
  url.hostname = 'www.notion.so';
  if (url.pathname === "/robots.txt") {
    return new Response("Sitemap: https://" + MY_DOMAIN + "/sitemap.xml");
  }
  if (url.pathname === "/sitemap.xml") {
    let response = new Response(generateSitemap());
    response.headers.set("content-type", "application/xml");
    return response;
  }
  let response;
  if (url.pathname.startsWith("/app") && url.pathname.endsWith("js")) {
    response = await fetch(url.toString());
    let body = await response.text();
    response = new Response(
      body
        .replace(/www.notion.so/g, MY_DOMAIN)
        .replace(/notion.so/g, MY_DOMAIN),
      response
    );
    response.headers.set("Content-Type", "application/x-javascript");
    return response;
  } else if (url.pathname.startsWith("/api")) {
    // Forward API
    response = await fetch(url.toString(), {
      body: url.pathname.startsWith('/api/v3/getPublicPageData') ? null : request.body,
      headers: {
        "content-type": "application/json;charset=UTF-8",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36"
      },
      method: "POST"
    });
    response = new Response(response.body, response);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } else if (slugs.indexOf(url.pathname.slice(1)) > -1) {
    const pageId = SLUG_TO_PAGE[url.pathname.slice(1)];
    return Response.redirect("https://" + MY_DOMAIN + "/" + pageId, 301);
  } else {
    response = await fetch(url.toString(), {
      body: request.body,
      headers: request.headers,
      method: request.method
    });
    response = new Response(response.body, response);
    response.headers.delete("Content-Security-Policy");
    response.headers.delete("X-Content-Security-Policy");
  }

  return appendJavascript(response, SLUG_TO_PAGE);
}

class MetaRewriter {
  element(element) {
    if (PAGE_TITLE !== "") {
      if (
        element.getAttribute("property") === "og:title" ||
        element.getAttribute("name") === "twitter:title"
      ) {
        element.setAttribute("content", PAGE_TITLE);
      }
      if (element.tagName === "title") {
        element.setInnerContent(PAGE_TITLE);
      }
    }
    if (PAGE_DESCRIPTION !== "") {
      if (
        element.getAttribute("name") === "description" ||
        element.getAttribute("property") === "og:description" ||
        element.getAttribute("name") === "twitter:description"
      ) {
        element.setAttribute("content", PAGE_DESCRIPTION);
      }
    }
    if (
      element.getAttribute("property") === "og:url" ||
      element.getAttribute("name") === "twitter:url"
    ) {
      element.setAttribute("content", MY_DOMAIN);
    }
    if (element.getAttribute("name") === "apple-itunes-app") {
      element.remove();
    }
  }
}

class HeadRewriter {
  element(element) {
    if (GOOGLE_FONT !== "") {
      element.append(
        `<link href='https://fonts.googleapis.com/css?family=${GOOGLE_FONT.replace(' ', '+')}:Regular,Bold,Italic&display=swap' rel='stylesheet'>
        <style>* { font-family: "${GOOGLE_FONT}" !important; }</style>`,
        {
          html: true
        }
      );
    }
    // 3: Comment
    // 4: Search
    // 5: Duplicate
    // 6: ...
    // 7: |
    // 8: Try Notion
    element.append(
      `<style>
      div.notion-topbar > div > div:nth-child(3) { display: none !important; }
      div.notion-topbar > div > div:nth-child(5) { display: none !important; }
      div.notion-topbar > div > div:nth-child(6) { display: none !important; }
      div.notion-topbar > div > div:nth-child(7) { display: none !important; }
      div.notion-topbar > div > div:nth-child(8) { display: none !important; }
      div.notion-topbar-mobile > div:nth-child(3) { display: none !important; }
      div.notion-topbar-mobile > div:nth-child(4) { display: none !important; }
      div.notion-topbar > div > div:nth-child(1n).toggle-mode { display: block !important; }
      div.notion-topbar-mobile > div:nth-child(1n).toggle-mode { display: block !important; }
      </style>`,
      {
        html: true
      }
    );
  }
}

class BodyRewriter {
  constructor(SLUG_TO_PAGE) {
    this.SLUG_TO_PAGE = SLUG_TO_PAGE;
  }
  element(element) {
    element.append(
      `<script>
      window.CONFIG.domainBaseUrl = 'https://${MY_DOMAIN}';
      const SLUG_TO_PAGE = ${JSON.stringify(this.SLUG_TO_PAGE)};
      const PAGE_TO_SLUG = {};
      const slugs = [];
      const pages = [];
      const el = document.createElement('div');

      // ========================
      // [ym add]
      // Comment & Duplicate
      const topEl = document.createElement('div');
      topEl.innerHTML = '<svg viewBox="0 0 16 16" class="speechBubbleThin" style="width: 14px; height: 14px; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden; margin-right: 6px;"><path d="M4.73926 15.6797C5.12207 15.6797 5.40918 15.4951 5.87402 15.085L8.21875 13.0068H12.3545C14.4121 13.0068 15.5674 11.8311 15.5674 9.80078V4.49609C15.5674 2.46582 14.4121 1.29004 12.3545 1.29004H3.63867C1.58105 1.29004 0.425781 2.46582 0.425781 4.49609V9.80078C0.425781 11.8311 1.6084 13.0068 3.59082 13.0068H3.87109V14.6953C3.87109 15.3037 4.19238 15.6797 4.73926 15.6797ZM5.07422 14.1758V12.2275C5.07422 11.8242 4.90332 11.667 4.51367 11.667H3.67285C2.38086 11.667 1.76562 11.0176 1.76562 9.75977V4.53711C1.76562 3.2793 2.38086 2.62988 3.67285 2.62988H12.3135C13.6055 2.62988 14.2275 3.2793 14.2275 4.53711V9.75977C14.2275 11.0176 13.6055 11.667 12.3135 11.667H8.14355C7.7334 11.667 7.52832 11.7354 7.24121 12.0361L5.07422 14.1758ZM4.51367 5.35059H11.4043C11.6367 5.35059 11.8281 5.15918 11.8281 4.91992C11.8281 4.69434 11.6367 4.50293 11.4043 4.50293H4.51367C4.28125 4.50293 4.09668 4.69434 4.09668 4.91992C4.09668 5.15918 4.28125 5.35059 4.51367 5.35059ZM4.51367 7.53125H11.4043C11.6367 7.53125 11.8281 7.33301 11.8281 7.10059C11.8281 6.86816 11.6367 6.67676 11.4043 6.67676H4.51367C4.28125 6.67676 4.09668 6.86816 4.09668 7.10059C4.09668 7.33301 4.28125 7.53125 4.51367 7.53125ZM4.51367 9.70508H9.00488C9.2373 9.70508 9.42188 9.51367 9.42188 9.28125C9.42188 9.04199 9.2373 8.85742 9.00488 8.85742H4.51367C4.28125 8.85742 4.09668 9.04199 4.09668 9.28125C4.09668 9.51367 4.28125 9.70508 4.51367 9.70508Z"></path></svg>Comment & Duplicate'
      topEl.className = 'notion-focusable';
      topEl.title = 'After clicking, you will be redirected to the original page on Notion. You can then use Comment and Duplicate features on the new page.'
      topEl.style.userSelect = 'none';
      topEl.style.transition = 'background 20ms ease-in 0s';
      topEl.style.cursor = 'pointer';
      topEl.style.display = 'inline-flex';
      topEl.style.alignItems = 'center';
      topEl.style.justifyContent = 'center';
      topEl.style.whiteSpace = 'nowrap';
      topEl.style.borderRadius = '4px';
      topEl.style.height = '32px';
      topEl.style.padding = '0px 8px';
      topEl.style.fontSize = '14px';
      topEl.style.lineHeight = '1.2';
      topEl.style.border = '1px solid rgba(55, 53, 47, 0.16)';
      topEl.style.marginRight = '8px';

      // Split Line
      const splitLineEl = document.createElement('div');
      splitLineEl.style.flex = '0 0 auto';
      splitLineEl.style.width = '1px';
      splitLineEl.style.height = '16px';
      splitLineEl.style.marginLeft = '8px';
      splitLineEl.style.marginRight = '8px';
      splitLineEl.style.background = 'rgba(55, 53, 47, 0.16)';
      // ========================

      let redirected = false;
      Object.keys(SLUG_TO_PAGE).forEach(slug => {
        const page = SLUG_TO_PAGE[slug];
        slugs.push(slug);
        pages.push(page);
        PAGE_TO_SLUG[page] = slug;
      });
      function getPage() {
        return location.pathname.slice(-32);
      }
      function getSlug() {
        return location.pathname.slice(1);
      }
      function updateSlug() {
        const slug = PAGE_TO_SLUG[getPage()];
        if (slug != null) {
          history.replaceState(history.state, '', '/' + slug);
        }
      }
      function onDark() {
        el.innerHTML = '<div title="Change to Light Mode" style="margin-left: auto; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgb(46, 170, 220); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(12px) translateY(0px);"></div></div></div></div>';
        document.body.classList.add('dark');
        __console.environment.ThemeStore.setState({ mode: 'dark' });
      };
      function onLight() {
        el.innerHTML = '<div title="Change to Dark Mode" style="margin-left: auto; margin-right: 14px; min-width: 0px;"><div role="button" tabindex="0" style="user-select: none; transition: background 120ms ease-in 0s; cursor: pointer; border-radius: 44px;"><div style="display: flex; flex-shrink: 0; height: 14px; width: 26px; border-radius: 44px; padding: 2px; box-sizing: content-box; background: rgba(135, 131, 120, 0.3); transition: background 200ms ease 0s, box-shadow 200ms ease 0s;"><div style="width: 14px; height: 14px; border-radius: 44px; background: white; transition: transform 200ms ease-out 0s, background 200ms ease-out 0s; transform: translateX(0px) translateY(0px);"></div></div></div></div>';
        document.body.classList.remove('dark');
        __console.environment.ThemeStore.setState({ mode: 'light' });
      }
      function toggle() {
        if (document.body.classList.contains('dark')) {
          onLight();
        } else {
          onDark();
        }
      }

      // ====================
      // [ym add]
      function oneMoreButton(nav){
        topEl.addEventListener("click",function(event){
          sourceUrl = window.location.href.replace('${MY_DOMAIN}','${MY_NOTION_DOMAIN}');
          window.location.href = sourceUrl.length <= ('https://${MY_NOTION_DOMAIN}/').length ? sourceUrl + SLUG_TO_PAGE[''] : sourceUrl;
        });
        topEl.addEventListener("mouseover", function() {
          topEl.style.background = "rgb(225, 225, 225)";
        });
        topEl.addEventListener("mouseout", function() {
          topEl.style.background = "none";
        });

        nav.children[0].appendChild(topEl);
        nav.children[0].appendChild(splitLineEl);
      }
      // ====================

      function addDarkModeButton(device) {
        const nav = device === 'web' ? document.querySelector('.notion-topbar').firstChild : document.querySelector('.notion-topbar-mobile');
        el.className = 'toggle-mode';
        el.addEventListener('click', toggle);
        nav.appendChild(el);

        // enable smart dark mode based on user-preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            onDark();
        } else {
            onLight();
        }

        // try to detect if user-preference change
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            toggle();
        });
      }
      const observer = new MutationObserver(function() {
        if (redirected) return;
        const nav = document.querySelector('.notion-topbar');
        const mobileNav = document.querySelector('.notion-topbar-mobile');
        if (nav && nav.firstChild && nav.firstChild.firstChild
          || mobileNav && mobileNav.firstChild) {
          redirected = true;
          updateSlug();

          // =====================
          // [ym add]
          oneMoreButton(nav);
          // =====================

          addDarkModeButton(nav ? 'web' : 'mobile');
          const onpopstate = window.onpopstate;
          window.onpopstate = function() {
            if (slugs.includes(getSlug())) {
              const page = SLUG_TO_PAGE[getSlug()];
              if (page) {
                history.replaceState(history.state, 'bypass', '/' + page);
              }
            }
            onpopstate.apply(this, [].slice.call(arguments));
            updateSlug();
          };
        }
      });
      observer.observe(document.querySelector('#notion-app'), {
        childList: true,
        subtree: true,
      });
      const replaceState = window.history.replaceState;
      window.history.replaceState = function(state) {
        if (arguments[1] !== 'bypass' && slugs.includes(getSlug())) return;
        return replaceState.apply(window.history, arguments);
      };
      const pushState = window.history.pushState;
      window.history.pushState = function(state) {
        const dest = new URL(location.protocol + location.host + arguments[2]);
        const id = dest.pathname.slice(-32);
        if (pages.includes(id)) {
          arguments[2] = '/' + PAGE_TO_SLUG[id];
        }
        return pushState.apply(window.history, arguments);
      };
      const open = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function() {
        arguments[1] = arguments[1].replace('${MY_DOMAIN}', 'www.notion.so');
        return open.apply(this, [].slice.call(arguments));
      };
    </script>${CUSTOM_SCRIPT}`,
      {
        html: true
      }
    );
  }
}

async function appendJavascript(res, SLUG_TO_PAGE) {
  return new HTMLRewriter()
    .on("title", new MetaRewriter())
    .on("meta", new MetaRewriter())
    .on("head", new HeadRewriter())
    .on("body", new BodyRewriter(SLUG_TO_PAGE))
    .transform(res);
}
