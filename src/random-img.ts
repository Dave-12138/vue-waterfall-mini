const randList = [
    'https://s2.loli.net/2023/10/03/n35iFr7VQpZLkEc.jpg',
    'https://s2.loli.net/2024/05/08/rCQiLvdMmxX6pgS.webp',
    'https://s2.loli.net/2024/05/08/Gnb6ksNRhIV74KW.webp',
    "https://s2.loli.net/2024/05/09/Lq8RD4UHbdX1goO.webp",
    "https://s2.loli.net/2024/05/09/QvL8IbYuDyTjcCq.webp",
    "https://s2.loli.net/2024/05/09/vkLFVO4pZsnxR9l.webp",
    "https://s2.loli.net/2023/11/12/vOEWRZNlKmSacgu.webp",
    "https://s2.loli.net/2024/03/27/h15Hgdjy4UzYEct.webp",
]
export function getRandImg() {
    return randList[Math.floor(randList.length * Math.random())] + '?' + crypto.randomUUID().replace(/-.*/,'');
}