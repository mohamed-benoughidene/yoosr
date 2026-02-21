const CONVEX_SITE_URL = "https://blessed-albatross-148.eu-west-1.convex.site";
async function test() {
    const url = new URL(`${CONVEX_SITE_URL}/widget/messages`)
    url.searchParams.set('conversationId', 'jh7bm2ekff353zgg41rq12f4x981kp9g')
    const res = await fetch(url.toString())
    console.log(await res.json())
}
test()
