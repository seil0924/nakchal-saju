// lib/cities.ts — 출생지 목록. 진태양시를 내려면 경도와 시간대가 둘 다 있어야 한다.
//
// 전 세계 지오코더를 붙이지 않고 주요 도시만 손으로 담았다. 이유가 둘이다.
// ① 진태양시 보정은 경도 1도에 4분이라, 같은 도시 안에서는 차이가 1분도 안 난다. 정밀할 이유가 없다.
// ② 브이월드는 한국만 되고, 전 세계 지오코더는 돈이 든다. 검증도 안 된 기능에 먼저 쓸 돈이 아니다.
//
// 목록에 없는 곳에서 태어났다면 가장 가까운 도시를 고르면 된다 — 경도가 몇 도 차이 나봐야 몇 분이다.
export type City = { city: string; country: string; lng: number; tz: string };

const RAW: [string, string, number, string][] = [
  ['Seoul','South Korea',126.98,'Asia/Seoul'],
  ['Busan','South Korea',129.08,'Asia/Seoul'],
  ['Tokyo','Japan',139.69,'Asia/Tokyo'],
  ['Osaka','Japan',135.50,'Asia/Tokyo'],
  ['Beijing','China',116.41,'Asia/Shanghai'],
  ['Shanghai','China',121.47,'Asia/Shanghai'],
  ['Guangzhou','China',113.26,'Asia/Shanghai'],
  ['Urumqi','China',87.62,'Asia/Shanghai'],
  ['Hong Kong','Hong Kong',114.17,'Asia/Hong_Kong'],
  ['Taipei','Taiwan',121.56,'Asia/Taipei'],
  ['Singapore','Singapore',103.82,'Asia/Singapore'],
  ['Kuala Lumpur','Malaysia',101.69,'Asia/Kuala_Lumpur'],
  ['Jakarta','Indonesia',106.85,'Asia/Jakarta'],
  ['Bangkok','Thailand',100.50,'Asia/Bangkok'],
  ['Ho Chi Minh City','Vietnam',106.63,'Asia/Ho_Chi_Minh'],
  ['Hanoi','Vietnam',105.83,'Asia/Ho_Chi_Minh'],
  ['Manila','Philippines',120.98,'Asia/Manila'],
  ['Delhi','India',77.21,'Asia/Kolkata'],
  ['Mumbai','India',72.88,'Asia/Kolkata'],
  ['Bengaluru','India',77.59,'Asia/Kolkata'],
  ['Kolkata','India',88.36,'Asia/Kolkata'],
  ['Dhaka','Bangladesh',90.41,'Asia/Dhaka'],
  ['Karachi','Pakistan',67.01,'Asia/Karachi'],
  ['Lahore','Pakistan',74.36,'Asia/Karachi'],
  ['Kathmandu','Nepal',85.32,'Asia/Kathmandu'],
  ['Colombo','Sri Lanka',79.86,'Asia/Colombo'],
  ['Dubai','UAE',55.27,'Asia/Dubai'],
  ['Riyadh','Saudi Arabia',46.68,'Asia/Riyadh'],
  ['Tehran','Iran',51.39,'Asia/Tehran'],
  ['Istanbul','Turkiye',28.98,'Europe/Istanbul'],
  ['Tel Aviv','Israel',34.78,'Asia/Jerusalem'],
  ['London','United Kingdom',-0.13,'Europe/London'],
  ['Dublin','Ireland',-6.26,'Europe/Dublin'],
  ['Paris','France',2.35,'Europe/Paris'],
  ['Madrid','Spain',-3.70,'Europe/Madrid'],
  ['Barcelona','Spain',2.17,'Europe/Madrid'],
  ['Lisbon','Portugal',-9.14,'Europe/Lisbon'],
  ['Berlin','Germany',13.40,'Europe/Berlin'],
  ['Munich','Germany',11.58,'Europe/Berlin'],
  ['Amsterdam','Netherlands',4.90,'Europe/Amsterdam'],
  ['Brussels','Belgium',4.35,'Europe/Brussels'],
  ['Zurich','Switzerland',8.54,'Europe/Zurich'],
  ['Vienna','Austria',16.37,'Europe/Vienna'],
  ['Rome','Italy',12.50,'Europe/Rome'],
  ['Milan','Italy',9.19,'Europe/Rome'],
  ['Prague','Czechia',14.42,'Europe/Prague'],
  ['Warsaw','Poland',21.01,'Europe/Warsaw'],
  ['Stockholm','Sweden',18.07,'Europe/Stockholm'],
  ['Oslo','Norway',10.75,'Europe/Oslo'],
  ['Copenhagen','Denmark',12.57,'Europe/Copenhagen'],
  ['Helsinki','Finland',24.94,'Europe/Helsinki'],
  ['Athens','Greece',23.73,'Europe/Athens'],
  ['Moscow','Russia',37.62,'Europe/Moscow'],
  ['Cairo','Egypt',31.24,'Africa/Cairo'],
  ['Lagos','Nigeria',3.38,'Africa/Lagos'],
  ['Nairobi','Kenya',36.82,'Africa/Nairobi'],
  ['Johannesburg','South Africa',28.05,'Africa/Johannesburg'],
  ['Casablanca','Morocco',-7.59,'Africa/Casablanca'],
  ['New York','United States',-73.94,'America/New_York'],
  ['Toronto','Canada',-79.38,'America/Toronto'],
  ['Chicago','United States',-87.63,'America/Chicago'],
  ['Houston','United States',-95.37,'America/Chicago'],
  ['Denver','United States',-104.99,'America/Denver'],
  ['Phoenix','United States',-112.07,'America/Phoenix'],
  ['Los Angeles','United States',-118.24,'America/Los_Angeles'],
  ['San Francisco','United States',-122.42,'America/Los_Angeles'],
  ['Seattle','United States',-122.33,'America/Los_Angeles'],
  ['Vancouver','Canada',-123.12,'America/Vancouver'],
  ['Honolulu','United States',-157.86,'Pacific/Honolulu'],
  ['Anchorage','United States',-149.90,'America/Anchorage'],
  ['Mexico City','Mexico',-99.13,'America/Mexico_City'],
  ['Sao Paulo','Brazil',-46.63,'America/Sao_Paulo'],
  ['Rio de Janeiro','Brazil',-43.17,'America/Sao_Paulo'],
  ['Buenos Aires','Argentina',-58.38,'America/Argentina/Buenos_Aires'],
  ['Santiago','Chile',-70.65,'America/Santiago'],
  ['Lima','Peru',-77.04,'America/Lima'],
  ['Bogota','Colombia',-74.07,'America/Bogota'],
  ['Sydney','Australia',151.21,'Australia/Sydney'],
  ['Melbourne','Australia',144.96,'Australia/Melbourne'],
  ['Brisbane','Australia',153.03,'Australia/Brisbane'],
  ['Perth','Australia',115.86,'Australia/Perth'],
  ['Auckland','New Zealand',174.76,'Pacific/Auckland'],
];

export const CITIES: City[] = RAW.map(([city, country, lng, tz]) => ({ city, country, lng, tz }));

export const cityKey = (c: City) => `${c.city}, ${c.country}`;

export function findCity(key: string): City | null {
  return CITIES.find(c => cityKey(c) === key) ?? null;
}

// 검색 — 도시와 나라 이름 아무 쪽이나 걸리면 내놓는다. 대소문자는 가리지 않는다.
export function searchCities(q: string, limit = 8): City[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const hit = CITIES.filter(c =>
    c.city.toLowerCase().includes(s) || c.country.toLowerCase().includes(s));
  // 도시 이름이 그 글자로 시작하는 쪽을 앞에 둔다 — 'san' 을 치면 San Francisco 가 먼저다.
  return hit.sort((a, b) => {
    const A = a.city.toLowerCase().startsWith(s) ? 0 : 1;
    const B = b.city.toLowerCase().startsWith(s) ? 0 : 1;
    return A - B || a.city.localeCompare(b.city);
  }).slice(0, limit);
}
