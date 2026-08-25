// lib/cities-zh.ts — 도시·나라 이름의 번체 중국어 표기.
//
// 좌표와 시간대는 lib/cities.ts 한 곳에만 둔다. 여기는 '이름표'만 갖는다.
// 이름과 좌표를 같이 들고 있으면 언젠가 한쪽만 고쳐져 계산이 어긋난다.
// 없는 도시는 영어 이름 그대로 내보낸다 — 빈칸보다는 낫다.
import { CITIES, type City } from '@/lib/cities';

const CITY: Record<string, string> = {
  Seoul: '首爾', Busan: '釜山', Tokyo: '東京', Osaka: '大阪',
  Beijing: '北京', Shanghai: '上海', Guangzhou: '廣州', Urumqi: '烏魯木齊',
  'Hong Kong': '香港', Taipei: '台北', Singapore: '新加坡', 'Kuala Lumpur': '吉隆坡',
  Jakarta: '雅加達', Bangkok: '曼谷', 'Ho Chi Minh City': '胡志明市', Hanoi: '河內',
  Manila: '馬尼拉', Delhi: '德里', Mumbai: '孟買', Bengaluru: '班加羅爾',
  Kolkata: '加爾各答', Dhaka: '達卡', Karachi: '喀拉蚩', Lahore: '拉合爾',
  Kathmandu: '加德滿都', Colombo: '可倫坡', Dubai: '杜拜', Riyadh: '利雅德',
  Tehran: '德黑蘭', Istanbul: '伊斯坦堡', 'Tel Aviv': '特拉維夫',
  London: '倫敦', Dublin: '都柏林', Paris: '巴黎', Madrid: '馬德里',
  Barcelona: '巴塞隆納', Lisbon: '里斯本', Berlin: '柏林', Munich: '慕尼黑',
  Amsterdam: '阿姆斯特丹', Brussels: '布魯塞爾', Zurich: '蘇黎世', Vienna: '維也納',
  Rome: '羅馬', Milan: '米蘭', Prague: '布拉格', Warsaw: '華沙',
  Stockholm: '斯德哥爾摩', Oslo: '奧斯陸', Copenhagen: '哥本哈根', Helsinki: '赫爾辛基',
  Athens: '雅典', Moscow: '莫斯科', Cairo: '開羅', Lagos: '拉各斯',
  Nairobi: '奈洛比', Johannesburg: '約翰尼斯堡', Casablanca: '卡薩布蘭加',
  'New York': '紐約', Toronto: '多倫多', Chicago: '芝加哥', Houston: '休士頓',
  Denver: '丹佛', Phoenix: '鳳凰城', 'Los Angeles': '洛杉磯', 'San Francisco': '舊金山',
  Seattle: '西雅圖', Vancouver: '溫哥華', Honolulu: '檀香山', Anchorage: '安克拉治',
  'Mexico City': '墨西哥城', 'Sao Paulo': '聖保羅', 'Rio de Janeiro': '里約熱內盧',
  'Buenos Aires': '布宜諾斯艾利斯', Santiago: '聖地牙哥', Lima: '利馬', Bogota: '波哥大',
  Sydney: '雪梨', Melbourne: '墨爾本', Brisbane: '布里斯本', Perth: '伯斯', Auckland: '奧克蘭',
};

const COUNTRY: Record<string, string> = {
  'South Korea': '韓國', Japan: '日本', China: '中國', 'Hong Kong': '香港', Taiwan: '台灣',
  Singapore: '新加坡', Malaysia: '馬來西亞', Indonesia: '印尼', Thailand: '泰國',
  Vietnam: '越南', Philippines: '菲律賓', India: '印度', Bangladesh: '孟加拉',
  Pakistan: '巴基斯坦', Nepal: '尼泊爾', 'Sri Lanka': '斯里蘭卡', UAE: '阿聯酋',
  'Saudi Arabia': '沙烏地阿拉伯', Iran: '伊朗', Turkiye: '土耳其', Israel: '以色列',
  'United Kingdom': '英國', Ireland: '愛爾蘭', France: '法國', Spain: '西班牙',
  Portugal: '葡萄牙', Germany: '德國', Netherlands: '荷蘭', Belgium: '比利時',
  Switzerland: '瑞士', Austria: '奧地利', Italy: '義大利', Czechia: '捷克',
  Poland: '波蘭', Sweden: '瑞典', Norway: '挪威', Denmark: '丹麥', Finland: '芬蘭',
  Greece: '希臘', Russia: '俄羅斯', Egypt: '埃及', Nigeria: '奈及利亞', Kenya: '肯亞',
  'South Africa': '南非', Morocco: '摩洛哥', 'United States': '美國', Canada: '加拿大',
  Mexico: '墨西哥', Brazil: '巴西', Argentina: '阿根廷', Chile: '智利', Peru: '秘魯',
  Colombia: '哥倫比亞', Australia: '澳洲', 'New Zealand': '紐西蘭',
};

export const cityZh = (c: City) => CITY[c.city] ?? c.city;
export const countryZh = (c: City) => COUNTRY[c.country] ?? c.country;
export const cityKeyZh = (c: City) => `${cityZh(c)}, ${countryZh(c)}`;

// 중국어 화면에서는 한자로도 영문으로도 찾을 수 있어야 한다.
// 홍콩·싱가포르 이용자는 두 가지를 섞어 쓴다.
export function searchCitiesZh(q: string, limit = 8): City[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const hit = CITIES.filter(c =>
    c.city.toLowerCase().includes(s) || c.country.toLowerCase().includes(s) ||
    cityZh(c).includes(q.trim()) || countryZh(c).includes(q.trim()));
  return hit.sort((a, b) => {
    const A = a.city.toLowerCase().startsWith(s) || cityZh(a).startsWith(q.trim()) ? 0 : 1;
    const B = b.city.toLowerCase().startsWith(s) || cityZh(b).startsWith(q.trim()) ? 0 : 1;
    return A - B || a.city.localeCompare(b.city);
  }).slice(0, limit);
}

