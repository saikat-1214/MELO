// Standardized Geographic Data for India & Global Countries

export interface StateInfo {
  name: string;
  code: string;
  districts: string[];
}

export const COUNTRIES = [
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵' },
];

export const INDIAN_STATES: StateInfo[] = [
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    districts: [
      'Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Kurnool',
      'Nellore (SPSR)', 'Anantapur', 'Chittoor', 'East Godavari (Kakinada)',
      'West Godavari (Bhimavaram)', 'Kadapa (YSR)', 'Srikakulam', 'Vizianagaram'
    ],
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    districts: [
      'Itanagar Capital Complex', 'Papum Pare', 'Tawang', 'West Kameng',
      'East Kameng', 'Lower Subansiri', 'Upper Subansiri', 'West Siang',
      'East Siang', 'Dibang Valley', 'Changlang', 'Tirap'
    ],
  },
  {
    name: 'Assam',
    code: 'AS',
    districts: [
      'Kamrup Metropolitan (Guwahati)', 'Kamrup', 'Dibrugarh', 'Jorhat',
      'Silchar (Cachar)', 'Nagaon', 'Sonitpur (Tezpur)', 'Tinsukia',
      'Barpeta', 'Dhubri', 'Golaghat', 'Bongaigaon'
    ],
  },
  {
    name: 'Bihar',
    code: 'BR',
    districts: [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga',
      'Purnia', 'Rohtas', 'Begusarai', 'Nalanda', 'Saran (Chhapra)',
      'Samastipur', 'Madhubani', 'Siwan', 'Vaishali'
    ],
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    districts: [
      'Raipur', 'Bilaspur', 'Durg (Bhilai)', 'Rajnandgaon', 'Korba',
      'Raigarh', 'Jagdalpur (Bastar)', 'Ambikapur (Surguja)', 'Dhamtari'
    ],
  },
  {
    name: 'Delhi (NCT)',
    code: 'DL',
    districts: [
      'Central Delhi', 'New Delhi', 'South Delhi', 'South East Delhi',
      'South West Delhi', 'West Delhi', 'North Delhi', 'North West Delhi',
      'North East Delhi', 'East Delhi', 'Shahdara'
    ],
  },
  {
    name: 'Goa',
    code: 'GA',
    districts: ['North Goa (Panaji)', 'South Goa (Margao)'],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    districts: [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
      'Bhavnagar', 'Jamnagar', 'Junagadh', 'Kutch (Bhuj)', 'Anand',
      'Bharuch', 'Navsari', 'Mehsana', 'Patan', 'Valsad'
    ],
  },
  {
    name: 'Haryana',
    code: 'HR',
    districts: [
      'Gurugram', 'Faridabad', 'Panchkula', 'Ambala', 'Karnal',
      'Panipat', 'Sonipat', 'Rohtak', 'Hisar', 'Kurukshetra', 'Yamunanagar'
    ],
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    districts: [
      'Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Kullu (Manali)',
      'Solan', 'Sirmaur', 'Hamirpur', 'Bilaspur', 'Chamba', 'Una'
    ],
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    districts: [
      'Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro',
      'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Palamu'
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    districts: [
      'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Dakshina Kannada (Mangaluru)',
      'Hubballi-Dharwad', 'Belagavi', 'Shivamogga', 'Tumakuru', 'Udupi',
      'Ballari', 'Kalaburagi', 'Davangere', 'Hassan', 'Chikkamagaluru'
    ],
  },
  {
    name: 'Kerala',
    code: 'KL',
    districts: [
      'Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur',
      'Kollam', 'Alappuzha', 'Kottayam', 'Malappuram', 'Palakkad',
      'Kannur', 'Idukki', 'Wayanad', 'Pathanamthitta', 'Kasaragod'
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    districts: [
      'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain',
      'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Singrauli'
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    districts: [
      'Mumbai City', 'Mumbai Suburban', 'Pune', 'Thane', 'Nagpur',
      'Nashik', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Kolhapur',
      'Solapur', 'Amravati', 'Nanded', 'Navi Mumbai', 'Raigad', 'Satara'
    ],
  },
  {
    name: 'Manipur',
    code: 'MN',
    districts: ['Imphal West', 'Imphal East', 'Bishnupur', 'Thoubal', 'Churachandpur', 'Ukhrul'],
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    districts: ['East Khasi Hills (Shillong)', 'West Khasi Hills', 'Ri-Bhoi', 'West Garo Hills (Tura)', 'Jaintia Hills'],
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
  },
  {
    name: 'Nagaland',
    code: 'NL',
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Mon', 'Phek'],
  },
  {
    name: 'Odisha',
    code: 'OD',
    districts: [
      'Khordha (Bhubaneswar)', 'Cuttack', 'Puri', 'Ganjam (Berhampur)',
      'Sundargarh (Rourkela)', 'Sambalpur', 'Balasore', 'Bhadrak', 'Angul', 'Jajpur'
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    districts: [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'SAS Nagar (Mohali)',
      'Bathinda', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur'
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    districts: [
      'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
      'Bikaner', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur', 'Pali'
    ],
  },
  {
    name: 'Sikkim',
    code: 'SK',
    districts: ['East Sikkim (Gangtok)', 'West Sikkim', 'South Sikkim (Namchi)', 'North Sikkim (Mangan)'],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    districts: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
      'Tirunelveli', 'Kanchipuram', 'Vellore', 'Erode', 'Thanjavur',
      'Dindigul', 'Cuddalore', 'Kanyakumari (Nagercoil)', 'Tiruppur'
    ],
  },
  {
    name: 'Telangana',
    code: 'TG',
    districts: [
      'Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal',
      'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda', 'Mahabubnagar'
    ],
  },
  {
    name: 'Tripura',
    code: 'TR',
    districts: ['West Tripura (Agartala)', 'Gomati (Udaipur)', 'South Tripura', 'North Tripura (Dharmanagar)', 'Dhalai'],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    districts: [
      'Lucknow', 'Kanpur Nagar', 'Varanasi', 'Gautam Buddha Nagar (Noida)',
      'Ghaziabad', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly',
      'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Jhansi', 'Mathura'
    ],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    districts: [
      'Dehradun', 'Haridwar', 'Nainital (Haldwani)', 'Udham Singh Nagar (Rudrapur)',
      'Almora', 'Pauri Garhwal', 'Tehri Garhwal', 'Chamoli'
    ],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    districts: [
      'Kolkata', 'Paschim Medinipur', 'Purba Medinipur', 'Howrah', 'Hooghly',
      'North 24 Parganas', 'South 24 Parganas', 'Darjeeling', 'Kalimpong',
      'Jalpaiguri', 'Alipurduar', 'Cooch Behar', 'Malda', 'Uttar Dinajpur',
      'Dakshin Dinajpur', 'Murshidabad', 'Nadia', 'Birbhum', 'Bankura',
      'Purulia', 'Jhargram', 'Paschim Bardhaman', 'Purba Bardhaman'
    ],
  },
  {
    name: 'Jammu and Kashmir',
    code: 'JK',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Budgam', 'Pulwama'],
  },
  {
    name: 'Ladakh',
    code: 'LA',
    districts: ['Leh', 'Kargil'],
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    districts: ['Chandigarh'],
  },
  {
    name: 'Puducherry',
    code: 'PY',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  },
  {
    name: 'Andaman and Nicobar Islands',
    code: 'AN',
    districts: ['South Andaman (Port Blair)', 'North and Middle Andaman', 'Nicobar'],
  },
];

export const searchStates = (query: string): StateInfo[] => {
  if (!query || !query.trim()) return INDIAN_STATES;
  const q = query.trim().toLowerCase();
  return INDIAN_STATES.filter(
    (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase() === q
  );
};

export const getDistrictsForState = (stateName: string, query?: string): string[] => {
  const match = INDIAN_STATES.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!match) return [];
  if (!query || !query.trim()) return match.districts;
  const q = query.trim().toLowerCase();
  return match.districts.filter((d) => d.toLowerCase().includes(q));
};
