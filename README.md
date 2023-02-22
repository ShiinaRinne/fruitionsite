# Fruition: Free, Open Source Toolkit For Customizing Your Notion Pages

Modify the original worker script to indirectly support `Comment` and `Duplicate` features. 

You can see the effect on [my blog](https://blog.youngmoe.com).
![](https://shiinarinne.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F2329816e-950d-4283-b4f1-30acd8cc1904%2FClip_20230223_003119.png?table=block&id=e0856723-0bdd-4954-9992-11d3ad7a72c1&spaceId=bfcfaaab-5c39-4cc4-94bb-c21cfa63d5da&width=1770&userId=&cache=v2)

---

* Use cases: perfect for your portfolio, blog, landing page, and business site
* Features: pretty URLs, custom domains, Google Fonts, SEO support, script injection
* Benefits: completely free, no lock-in, and open source

For step-by-step setup instructions, visit https://fruitionsite.com

This repo has 2 independent parts:
1. [worker.js](https://github.com/stephenou/fruitionsite/blob/master/worker.js) is the Cloudflare Worker script
2. everything else is a React app that helps generate the Worker script via a UI.
