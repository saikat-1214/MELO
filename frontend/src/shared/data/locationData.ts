// Standardized Geographic Data for India & Global Countries (Alphabetically Sorted)

export interface StateInfo {
  name: string;
  code: string;
  districts: string[];
}

export const COUNTRIES = [
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'United States', code: 'US', flag: '🇺🇸' },
];

export const INDIAN_STATES: StateInfo[] = [
  {
    name: 'Andaman and Nicobar Islands',
    code: 'AN',
    districts: [
      'Nicobar', 'North and Middle Andaman', 'South Andaman (Port Blair)'
    ],
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    districts: [
      'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya',
      'Bapatla', 'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari (Rajamahendravaram)',
      'Eluru', 'Guntur', 'Kakinada', 'Krishna (Machilipatnam)',
      'Kurnool', 'Nandyal', 'NTR (Vijayawada)', 'Palnadu (Narasaraopet)',
      'Parvathipuram Manyam', 'Prakasam (Ongole)', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai',
      'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram',
      'West Godavari (Bhimavaram)', 'YSR Kadapa'
    ],
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    districts: [
      'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng',
      'East Siang', 'Kamle', 'Kra Daadi', 'Kurung Kumey',
      'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley',
      'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang',
      'Papum Pare (Itanagar)', 'Shi Yomi', 'Siang', 'Tawang',
      'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng',
      'West Siang'
    ],
  },
  {
    name: 'Assam',
    code: 'AS',
    districts: [
      'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon',
      'Cachar (Silchar)', 'Charaideo', 'Chirang', 'Darrang',
      'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao',
      'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai',
      'Jorhat', 'Kamrup', 'Kamrup Metropolitan (Guwahati)', 'Karbi Anglong',
      'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli',
      'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar',
      'Sonitpur (Tezpur)', 'South Salmara-Mankachar', 'Tamulpur', 'Tinsukia',
      'Udalguri', 'West Karbi Anglong'
    ],
  },
  {
    name: 'Bihar',
    code: 'BR',
    districts: [
      'Araria', 'Arwal', 'Aurangabad', 'Banka',
      'Begusarai', 'Bhagalpur', 'Bhojpur (Arrah)', 'Buxar',
      'Darbhanga', 'East Champaran (Motihari)', 'Gaya', 'Gopalganj',
      'Jamui', 'Jehanabad', 'Kaimur (Bhabua)', 'Katihar',
      'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura',
      'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda (Bihar Sharif)',
      'Nawada', 'Patna', 'Purnia', 'Rohtas (Sasaram)',
      'Saharsa', 'Samastipur', 'Saran (Chhapra)', 'Sheikhpura',
      'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul',
      'Vaishali (Hajipur)', 'West Champaran (Bettiah)'
    ],
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    districts: [
      'Chandigarh'
    ],
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    districts: [
      'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar (Jagdalpur)',
      'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada (South Bastar)',
      'Dhamtari', 'Durg (Bhilai)', 'Gariaband', 'Gaurela-Pendra-Marwahi',
      'Janjgir-Champa', 'Jashpur', 'Kabirdham (Kawardha)', 'Kanker (North Bastar)',
      'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon', 'Korba', 'Korea',
      'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli',
      'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon',
      'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja (Ambikapur)'
    ],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    code: 'DH',
    districts: [
      'Dadra and Nagar Haveli (Silvassa)', 'Daman', 'Diu'
    ],
  },
  {
    name: 'Delhi (NCT)',
    code: 'DL',
    districts: [
      'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
      'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi',
      'South East Delhi', 'South West Delhi', 'West Delhi'
    ],
  },
  {
    name: 'Goa',
    code: 'GA',
    districts: [
      'North Goa (Panaji)', 'South Goa (Margao)'
    ],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    districts: [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli',
      'Banaskantha (Palanpur)', 'Bharuch', 'Bhavnagar', 'Botad',
      'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhumi Dwarka',
      'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh',
      'Kheda (Nadiad)', 'Kutch (Bhuj)', 'Mahisagar', 'Mehsana',
      'Morbi', 'Narmada (Rajpipla)', 'Navsari', 'Panchmahal (Godhra)',
      'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha (Himmatnagar)',
      'Surat', 'Surendranagar', 'Tapi (Vyara)', 'Vadodara',
      'Valsad'
    ],
  },
  {
    name: 'Haryana',
    code: 'HR',
    districts: [
      'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad',
      'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar',
      'Jind', 'Kaithal', 'Karnal', 'Kurukshetra',
      'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula',
      'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
      'Sonipat', 'Yamunanagar'
    ],
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    districts: [
      'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra (Dharamshala)',
      'Kinnaur', 'Kullu (Manali)', 'Lahaul and Spiti', 'Mandi',
      'Shimla', 'Sirmaur (Nahan)', 'Solan', 'Una'
    ],
  },
  {
    name: 'Jammu and Kashmir',
    code: 'JK',
    districts: [
      'Anantnag', 'Bandipora', 'Baramulla', 'Budgam',
      'Doda', 'Ganderbal', 'Jammu', 'Kathua',
      'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch',
      'Pulwama', 'Rajouri', 'Ramban', 'Reasi',
      'Samba', 'Shopian', 'Srinagar', 'Udhampur'
    ],
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    districts: [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad',
      'Dumka', 'East Singhbhum (Jamshedpur)', 'Garhwa', 'Giridih',
      'Godda', 'Gumla', 'Hazaribagh', 'Jamtara',
      'Khunti', 'Koderma', 'Latehar', 'Lohardaga',
      'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
      'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum (Chaibasa)'
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    districts: [
      'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural',
      'Bengaluru Urban', 'Bidar', 'Chamarajanagara', 'Chikkaballapura',
      'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada (Mangaluru)', 'Davangere',
      'Dharwad (Hubballi)', 'Gadag', 'Hassan', 'Haveri',
      'Kalaburagi', 'Kodagu (Madikeri)', 'Kolar', 'Koppal',
      'Mandya', 'Mysuru', 'Raichur', 'Ramanagara',
      'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada (Karwar)',
      'Vijayanagara', 'Yadgir'
    ],
  },
  {
    name: 'Kerala',
    code: 'KL',
    districts: [
      'Alappuzha', 'Ernakulam (Kochi)', 'Idukki', 'Kannur',
      'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode',
      'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram',
      'Thrissur', 'Wayanad'
    ],
  },
  {
    name: 'Ladakh',
    code: 'LA',
    districts: [
      'Kargil', 'Leh'
    ],
  },
  {
    name: 'Lakshadweep',
    code: 'LD',
    districts: [
      'Lakshadweep (Kavaratti)'
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    districts: [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar',
      'Balaghat', 'Barwani', 'Betul', 'Bhind',
      'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara',
      'Damoh', 'Datia', 'Dewas', 'Dhar',
      'Dindori', 'Guna', 'Gwalior', 'Harda',
      'Hoshangabad (Narmadapuram)', 'Indore', 'Jabalpur', 'Jhabua',
      'Katni', 'Khandwa', 'Khargone', 'Mandla',
      'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch',
      'Niwari', 'Panna', 'Raisen', 'Rajgarh',
      'Ratlam', 'Rewa', 'Sagar', 'Satna',
      'Sehore', 'Seoni', 'Shahdol', 'Shajapur',
      'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli',
      'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    districts: [
      'Ahmednagar (Ahilyanagar)', 'Akola', 'Amravati', 'Beed',
      'Bhandara', 'Buldhana', 'Chandrapur', 'Chhatrapati Sambhajinagar (Aurangabad)',
      'Dharashiv (Osmanabad)', 'Dhule', 'Gadchiroli', 'Gondia',
      'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
      'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
      'Nanded', 'Nandurbar', 'Nashik', 'Navi Mumbai',
      'Palghar', 'Parbhani', 'Pune', 'Raigad',
      'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg',
      'Solapur', 'Thane', 'Wardha', 'Washim',
      'Yavatmal'
    ],
  },
  {
    name: 'Manipur',
    code: 'MN',
    districts: [
      'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East',
      'Imphal West', 'Jiribam', 'Kakching', 'Kamjong',
      'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati',
      'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
    ],
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    districts: [
      'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills (Shillong)', 'Eastern West Khasi Hills',
      'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills', 'South West Garo Hills',
      'South West Khasi Hills', 'West Garo Hills (Tura)', 'West Jaintia Hills', 'West Khasi Hills'
    ],
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    districts: [
      'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl',
      'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit',
      'Saitual', 'Serchhip', 'Siaha'
    ],
  },
  {
    name: 'Nagaland',
    code: 'NL',
    districts: [
      'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima',
      'Longleng', 'Mokokchung', 'Mon', 'Niuland',
      'Noklak', 'Peren', 'Phek', 'Shamator',
      'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'
    ],
  },
  {
    name: 'Odisha',
    code: 'OD',
    districts: [
      'Angul', 'Balangir', 'Balasore', 'Bargarh',
      'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh',
      'Dhenkanal', 'Gajapati', 'Ganjam (Berhampur)', 'Jagatsinghpur',
      'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal',
      'Kendrapara', 'Kendujhar (Keonjhar)', 'Khordha (Bhubaneswar)', 'Koraput',
      'Malkangiri', 'Mayurbhanj (Baripada)', 'Nabarangpur', 'Nayagarh',
      'Nuapada', 'Puri', 'Rayagada', 'Sambalpur',
      'Subarnapur (Sonepur)', 'Sundargarh (Rourkela)'
    ],
  },
  {
    name: 'Puducherry',
    code: 'PY',
    districts: [
      'Karaikal', 'Mahe', 'Puducherry', 'Yanam'
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    districts: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot',
      'Fatehgarh Sahib', 'Fazilka', 'Firozpur', 'Gurdaspur',
      'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana',
      'Malerkotla', 'Mansa', 'Moga', 'Muktsar',
      'Pathankot', 'Patiala', 'Rupnagar (Ropar)', 'Sahibzada Ajit Singh Nagar (Mohali)',
      'Sangrur', 'Shahid Bhagat Singh Nagar (Nawanshahr)', 'Tarn Taran'
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    districts: [
      'Ajmer', 'Alwar', 'Anupgarh', 'Balotra',
      'Banswara', 'Baran', 'Barmer', 'Beawar',
      'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi',
      'Chittorgarh', 'Churu', 'Dausa', 'Deeg',
      'Dholpur', 'Didwana-Kuchaman', 'Dudu', 'Dungarpur',
      'Gangapur City', 'Hanumangarh', 'Jaipur', 'Jaipur Rural',
      'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu',
      'Jodhpur', 'Jodhpur Rural', 'Karauli', 'Kekri',
      'Khairthal-Tijara', 'Kota', 'Kotputli-Behror', 'Nagaur',
      'Neem Ka Thana', 'Pali', 'Phalodi', 'Pratapgarh',
      'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur',
      'Shahpura', 'Sikar', 'Sirohi', 'Sri Ganganagar',
      'Tonk', 'Udaipur'
    ],
  },
  {
    name: 'Sikkim',
    code: 'SK',
    districts: [
      'Gangtok (East Sikkim)', 'Gyalshing (West Sikkim)', 'Mangan (North Sikkim)', 'Namchi (South Sikkim)',
      'Pakyong', 'Soreng'
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    districts: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore',
      'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode',
      'Kallakurichi', 'Kanchipuram', 'Kanyakumari (Nagercoil)', 'Karur',
      'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam',
      'Namakkal', 'Nilgiris (Udhagamandalam)', 'Perambalur', 'Pudukkottai',
      'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
      'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi (Tuticorin)',
      'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur',
      'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
      'Viluppuram', 'Virudhunagar'
    ],
  },
  {
    name: 'Telangana',
    code: 'TG',
    districts: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad',
      'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal',
      'Kamareddy', 'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad',
      'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak',
      'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
      'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli',
      'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet',
      'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal',
      'Yadadri Bhuvanagiri'
    ],
  },
  {
    name: 'Tripura',
    code: 'TR',
    districts: [
      'Dhalai (Ambassa)', 'Gomati (Udaipur)', 'Khowai', 'North Tripura (Dharmanagar)',
      'Sepahijala (Bishramganj)', 'South Tripura (Belonia)', 'Unakoti (Kailashahar)', 'West Tripura (Agartala)'
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    districts: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi',
      'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh',
      'Baghpat', 'Bahraich', 'Ballia', 'Balrampur',
      'Banda', 'Barabanki', 'Bareilly', 'Basti',
      'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr',
      'Chandauli', 'Chitrakoot', 'Deoria', 'Etah',
      'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad',
      'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Ghazipur', 'Gonda',
      'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi',
      'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
      'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj',
      'Kaushambi', 'Kheri (Lakhimpur)', 'Kushinagar', 'Lalitpur',
      'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri',
      'Mathura', 'Mau', 'Meerut', 'Mirzapur',
      'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
      'Prayagraj (Allahabad)', 'Raebareli', 'Rampur', 'Saharanpur',
      'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli',
      'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra',
      'Sultanpur', 'Unnao', 'Varanasi'
    ],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    districts: [
      'Almora', 'Bageshwar', 'Chamoli (Gopeshwar)', 'Champawat',
      'Dehradun', 'Haridwar', 'Nainital (Haldwani)', 'Pauri Garhwal',
      'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar (Rudrapur)',
      'Uttarkashi'
    ],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    districts: [
      'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar',
      'Dakshin Dinajpur (Balurghat)', 'Darjeeling', 'Hooghly (Chinsurah)', 'Howrah',
      'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata',
      'Malda (English Bazar)', 'Murshidabad (Baharampur)', 'Nadia (Krishnanagar)', 'North 24 Parganas (Barasat)',
      'Paschim Bardhaman (Asansol)', 'Paschim Medinipur (Midnapore)', 'Purba Bardhaman (Bardhaman)', 'Purba Medinipur (Tamluk)',
      'Purulia', 'South 24 Parganas (Alipore)', 'Uttar Dinajpur (Raiganj)'
    ],
  },
];

/**
 * Searches states and returns matching states strictly in alphabetical order.
 */
export const searchStates = (query: string): StateInfo[] => {
  if (!query || !query.trim()) {
    return [...INDIAN_STATES].sort((a, b) => a.name.localeCompare(b.name));
  }
  const q = query.trim().toLowerCase();
  return INDIAN_STATES
    .filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase() === q)
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Returns districts for a given state, filtered and strictly sorted in alphabetical order.
 */
export const getDistrictsForState = (stateName: string, query?: string): string[] => {
  const match = INDIAN_STATES.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
  );
  if (!match) return [];
  const list = match.districts;
  if (!query || !query.trim()) {
    return [...list].sort((a, b) => a.localeCompare(b));
  }
  const q = query.trim().toLowerCase();
  return list
    .filter((d) => d.toLowerCase().includes(q))
    .sort((a, b) => a.localeCompare(b));
};
