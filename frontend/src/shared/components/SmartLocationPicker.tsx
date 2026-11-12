import React, { useState, useEffect, useRef } from 'react';
import {
  COUNTRIES,
  searchStates,
  getDistrictsForState,
} from '@/shared/data/locationData';
import { MapPin, Search, ChevronDown, Check, AlertCircle } from 'lucide-react';

export interface LocationDetails {
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
}

interface SmartLocationPickerProps {
  initialValue?: string;
  onChange: (formattedAddress: string, details: LocationDetails) => void;
  error?: string | null;
}

export const SmartLocationPicker: React.FC<SmartLocationPickerProps> = ({
  initialValue = '',
  onChange,
  error,
}) => {
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Dropdown visibility
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);

  // Filtered queries
  const [stateQuery, setStateQuery] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');

  const stateContainerRef = useRef<HTMLDivElement>(null);
  const districtContainerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        stateContainerRef.current &&
        !stateContainerRef.current.contains(e.target as Node)
      ) {
        setShowStateMenu(false);
      }
      if (
        districtContainerRef.current &&
        !districtContainerRef.current.contains(e.target as Node)
      ) {
        setShowDistrictMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse initial value if provided and fields are empty
  useEffect(() => {
    if (initialValue && !state && !district && !city) {
      const parts = initialValue.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        setCity(parts[0]);
        setDistrict(parts[1]);
        const stateAndPin = parts[2].split('-').map((s) => s.trim());
        setState(stateAndPin[0] || '');
        setStateQuery(stateAndPin[0] || '');
        if (stateAndPin[1]) setPincode(stateAndPin[1]);
      } else if (parts.length === 2) {
        setDistrict(parts[0]);
        setDistrictQuery(parts[0]);
        setState(parts[1]);
        setStateQuery(parts[1]);
      } else if (parts.length === 1) {
        setDistrict(parts[0]);
        setDistrictQuery(parts[0]);
      }
    }
  }, [initialValue]);

  // Formulate canonical location string and notify parent
  useEffect(() => {
    const parts: string[] = [];
    if (city.trim()) parts.push(city.trim());
    if (district.trim()) parts.push(district.trim());
    if (state.trim()) {
      if (pincode.trim()) {
        parts.push(`${state.trim()} - ${pincode.trim()}`);
      } else {
        parts.push(state.trim());
      }
    }
    if (country.trim() && country !== 'India') {
      parts.push(country.trim());
    }

    const formatted = parts.join(', ');
    onChange(formatted, {
      country,
      state,
      district,
      city,
      pincode,
    });
  }, [country, state, district, city, pincode]);

  // State filtering
  const filteredStates = searchStates(stateQuery);

  // District filtering
  const availableDistricts = state ? getDistrictsForState(state, districtQuery) : [];

  const handleSelectState = (stateName: string) => {
    setState(stateName);
    setStateQuery(stateName);
    setShowStateMenu(false);
    // If district was from another state, reset or keep if valid
    const validInNew = getDistrictsForState(stateName);
    if (!validInNew.includes(district)) {
      setDistrict('');
      setDistrictQuery('');
    }
  };

  const handleSelectDistrict = (distName: string) => {
    setDistrict(distName);
    setDistrictQuery(distName);
    setShowDistrictMenu(false);
  };

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Country *
          </label>
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* State / UT with Smart Autocomplete */}
        <div ref={stateContainerRef} className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State / Union Territory *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Type state (e.g. A for Andhra/Arunachal...)"
              value={stateQuery}
              onFocus={() => setShowStateMenu(true)}
              onChange={(e) => {
                setStateQuery(e.target.value);
                setState(e.target.value);
                setShowStateMenu(true);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* State Suggestions Dropdown */}
          {showStateMenu && (
            <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {filteredStates.length > 0 ? (
                filteredStates.map((s) => (
                  <button
                    type="button"
                    key={s.code}
                    onClick={() => handleSelectState(s.name)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition ${
                      state === s.name
                        ? 'bg-brand-50 font-bold text-brand-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.code}</span>
                  </button>
                ))
              ) : (
                <div className="p-2 text-center text-xs text-slate-400">
                  No matching state found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* District & City/Town/Village */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* District Field with Autocomplete */}
        <div ref={districtContainerRef} className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              District *
            </label>
            {state && (
              <span className="text-[10px] text-brand-600 font-medium">
                {availableDistricts.length} in {state}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={
                state
                  ? `e.g. ${availableDistricts[0] || 'District name'}`
                  : 'Select State first or type district'
              }
              value={districtQuery}
              onFocus={() => setShowDistrictMenu(true)}
              onChange={(e) => {
                setDistrictQuery(e.target.value);
                setDistrict(e.target.value);
                setShowDistrictMenu(true);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* District Suggestions Dropdown */}
          {showDistrictMenu && availableDistricts.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {availableDistricts.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleSelectDistrict(d)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition ${
                    district === d
                      ? 'bg-brand-50 font-bold text-brand-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{d}</span>
                  {district === d && <Check className="h-3 w-3 text-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City / Town / Village / Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            City / Town / Village *
          </label>
          <input
            type="text"
            placeholder="e.g. Kharagpur, Midnapore, Salt Lake..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            PIN / Postal Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="e.g. 721301"
            value={pincode}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, '');
              setPincode(cleaned);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Formatted Preview Badge */}
        <div className="flex flex-col justify-end">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2.5 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                Selected Regional Locality:
              </span>
              <p className="text-xs font-semibold text-emerald-800 break-words leading-tight">
                {city || district || state ? (
                  `${city ? city + ', ' : ''}${district ? district + ', ' : ''}${state ? state : ''}${pincode ? ' - ' + pincode : ''}`
                ) : (
                  <span className="text-slate-400 font-normal italic">
                    Fill the fields above to preview your area
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
