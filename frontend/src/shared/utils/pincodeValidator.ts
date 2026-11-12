// Indian Postal PIN Code Validation and Geographic Consistency Utilities

export interface PinLookupResult {
  isValid: boolean;
  state: string | null;
  district: string | null;
  canonicalDistrict: string | null;
  postOffices: string[];
  errorMessage?: string;
}

const DISTRICT_ALIASES: Record<string, string> = {
  // West Bengal
  westmidnapore: 'Paschim Medinipur',
  midnaporewest: 'Paschim Medinipur',
  paschimmedinipur: 'Paschim Medinipur',
  midnapore: 'Paschim Medinipur',
  eastmidnapore: 'Purba Medinipur',
  midnaporeeast: 'Purba Medinipur',
  purbamedinipur: 'Purba Medinipur',
  tamluk: 'Purba Medinipur',
  burdwan: 'Paschim Bardhaman',
  bardhaman: 'Purba Bardhaman',
  coochbehar: 'Cooch Behar',
  southdinajpur: 'Dakshin Dinajpur',
  northdinajpur: 'Uttar Dinajpur',

  // Maharashtra
  mumbai: 'Mumbai City',
  mumbaicity: 'Mumbai City',
  mumbaisuburban: 'Mumbai Suburban',
  aurangabad: 'Chhatrapati Sambhajinagar',
  osmanabad: 'Dharashiv',
  ahmednagar: 'Ahmednagar',

  // Karnataka
  bangalore: 'Bengaluru Urban',
  bangaloreurban: 'Bengaluru Urban',
  bengaluruurban: 'Bengaluru Urban',
  bangalorerural: 'Bengaluru Rural',
  bengalururural: 'Bengaluru Rural',
  mangalore: 'Dakshina Kannada',
  southcanara: 'Dakshina Kannada',
  northcanara: 'Uttara Kannada',
  gulbarga: 'Kalaburagi',
  belgaum: 'Belagavi',
  bellary: 'Ballari',
  mysore: 'Mysuru',
  shimoga: 'Shivamogga',

  // Uttar Pradesh
  allahabad: 'Prayagraj',
  faizabad: 'Ayodhya',
  noida: 'Gautam Buddha Nagar',
  kanpur: 'Kanpur Nagar',
  lakhimpur: 'Lakhimpur Kheri',

  // Haryana
  gurgaon: 'Gurugram',

  // Tamil Nadu
  madras: 'Chennai',
  tuticorin: 'Thoothukudi',
  trichy: 'Tiruchirappalli',
  tanjore: 'Thanjavur',

  // Odisha
  orissa: 'Odisha',
  bhubaneswar: 'Khordha',
  rourkela: 'Sundargarh',
  berhampur: 'Ganjam',

  // Andhra Pradesh
  vijayawada: 'NTR',
  kakinada: 'Kakinada',
  kadapa: 'YSR Kadapa',
  nellore: 'Sri Potti Sriramulu Nellore',
};

const STATE_ALIASES: Record<string, string> = {
  orissa: 'Odisha',
  pondicherry: 'Puducherry',
  uttaranchal: 'Uttarakhand',
  delhi: 'Delhi',
  'delhi nct': 'Delhi',
  'national capital territory of delhi': 'Delhi',
};

export const normalizeStr = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Checks if selected district matches postal district using normalization and alias tables.
 */
export const matchDistrict = (
  selectedDistrict: string,
  postalDistrict: string
): boolean => {
  if (!selectedDistrict || !postalDistrict) return false;
  const normSel = normalizeStr(selectedDistrict);
  const normPost = normalizeStr(postalDistrict);

  if (normSel === normPost) return true;
  if (normSel.includes(normPost) || normPost.includes(normSel)) return true;

  const aliasSel = DISTRICT_ALIASES[normSel] || selectedDistrict;
  const aliasPost = DISTRICT_ALIASES[normPost] || postalDistrict;

  if (normalizeStr(aliasSel) === normalizeStr(aliasPost)) return true;
  if (normalizeStr(aliasSel) === normPost || normalizeStr(aliasPost) === normSel) return true;

  // Special cases for split districts (e.g. Bardhaman, Midnapore)
  if (normPost.includes('midnapore') && (normSel.includes('medinipur') || normSel.includes('midnapore'))) {
    if (normPost.includes('west') && normSel.includes('paschim')) return true;
    if (normPost.includes('east') && normSel.includes('purba')) return true;
  }
  if (normPost.includes('burdwan') && normSel.includes('bardhaman')) {
    return true;
  }

  return false;
};

/**
 * Checks if selected state matches postal state.
 */
export const matchState = (selectedState: string, postalState: string): boolean => {
  if (!selectedState || !postalState) return false;
  const normSel = normalizeStr(selectedState);
  const normPost = normalizeStr(postalState);

  if (normSel === normPost) return true;
  const aliasSel = STATE_ALIASES[normSel] || selectedState;
  const aliasPost = STATE_ALIASES[normPost] || postalState;

  return normalizeStr(aliasSel) === normalizeStr(aliasPost);
};

/**
 * Resolves a postal district name into our standard canonical district name.
 */
export const getCanonicalDistrict = (
  postalDistrict: string,
  availableDistrictsForState: string[] = []
): string => {
  if (!postalDistrict) return '';
  const normPost = normalizeStr(postalDistrict);

  // Check alias dictionary
  if (DISTRICT_ALIASES[normPost]) {
    return DISTRICT_ALIASES[normPost];
  }

  // Look in available districts for closest match
  const found = availableDistrictsForState.find((d) => matchDistrict(d, postalDistrict));
  if (found) return found;

  return postalDistrict;
};

/**
 * Queries India Post public API to validate a 6-digit PIN code.
 */
export const lookupIndianPin = async (
  pincode: string,
  availableDistrictsForState: string[] = []
): Promise<PinLookupResult> => {
  const cleaned = pincode.replace(/[^0-9]/g, '');
  if (cleaned.length !== 6) {
    return {
      isValid: false,
      state: null,
      district: null,
      canonicalDistrict: null,
      postOffices: [],
      errorMessage: 'PIN code must be exactly 6 numeric digits.',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Postal API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    if (
      Array.isArray(data) &&
      data[0]?.Status === 'Success' &&
      Array.isArray(data[0]?.PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const firstPo = data[0].PostOffice[0];
      const rawDistrict = firstPo.District || '';
      const rawState = firstPo.State || '';

      const postOffices: string[] = Array.from(
        new Set(data[0].PostOffice.map((po: { Name?: string }) => po.Name).filter(Boolean))
      );

      const canonicalDistrict = getCanonicalDistrict(
        rawDistrict,
        availableDistrictsForState
      );

      return {
        isValid: true,
        state: rawState,
        district: rawDistrict,
        canonicalDistrict: canonicalDistrict || rawDistrict,
        postOffices,
      };
    } else {
      return {
        isValid: false,
        state: null,
        district: null,
        canonicalDistrict: null,
        postOffices: [],
        errorMessage: `PIN ${cleaned} does not exist in postal records.`,
      };
    }
  } catch (err: unknown) {
    // If network fails, do not block the user completely, but allow fallback
    console.warn('PIN lookup offline or timed out:', err);
    return {
      isValid: true, // Graceful fallback on network failure
      state: null,
      district: null,
      canonicalDistrict: null,
      postOffices: [],
    };
  }
};

