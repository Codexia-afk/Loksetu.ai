import React, { useState } from 'react';

interface SchemeFormProps {
  onSubmit: (formData: Record<string, string>) => void;
}

export const SchemeForm: React.FC<SchemeFormProps> = ({ onSubmit }) => {
  const [formState, setFormState] = useState<Record<string, string>>({
    full_name: '',
    dob: '',
    gender: 'Male',
    aadhaar_number: '',
    mobile_number: '',
    state: 'West Bengal',
    district: '',
    block_tehsil: '',
    village_ward: '',
    pincode: '',
    farmer_category: 'Small',
    annual_income: '',
    nature_of_occupancy: '',
    land_holding_scale: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <form id="krishak-bandhu-form" onSubmit={handleSubmit}>
      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="form-section" data-section="personal">
        <h3 className="section-title">1. Personal Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="full_name">
              Full Name (as in Aadhaar)<span className="required">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="form-control"
              placeholder="e.g. Ramesh Chandra Das"
              value={formState.full_name}
              onChange={handleChange}
              aria-required="true"
              aria-label="Full Name as per Aadhaar Card"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob">
              Date of Birth<span className="required">*</span>
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              className="form-control"
              value={formState.dob}
              onChange={handleChange}
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">
              Gender<span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              className="form-control"
              value={formState.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="aadhaar_number">
              Aadhaar Number (12 Digits)<span className="required">*</span>
            </label>
            <input
              type="text"
              id="aadhaar_number"
              name="aadhaar_number"
              className="form-control"
              placeholder="1234 5678 9012"
              maxLength={12}
              value={formState.aadhaar_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile_number">
              Mobile Number (Aadhaar Linked)<span className="required">*</span>
            </label>
            <input
              type="text"
              id="mobile_number"
              name="mobile_number"
              className="form-control"
              placeholder="9876543210"
              maxLength={10}
              value={formState.mobile_number}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ADDRESS & DOMICILE */}
      <div className="form-section" data-section="address">
        <h3 className="section-title">2. Address & Domicile Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="state">
              State of Domicile<span className="required">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              className="form-control"
              value={formState.state}
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="district">
              District<span className="required">*</span>
            </label>
            <input
              type="text"
              id="district"
              name="district"
              className="form-control"
              placeholder="e.g. Purba Bardhaman"
              value={formState.district}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="block_tehsil">
              Block / Tehsil<span className="required">*</span>
            </label>
            <input
              type="text"
              id="block_tehsil"
              name="block_tehsil"
              className="form-control"
              placeholder="e.g. Memari-I"
              value={formState.block_tehsil}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="village_ward">
              Gram Panchayat / Village / Ward<span className="required">*</span>
            </label>
            <input
              type="text"
              id="village_ward"
              name="village_ward"
              className="form-control"
              placeholder="e.g. Radhakantapur"
              value={formState.village_ward}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pincode">
              PIN Code<span className="required">*</span>
            </label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              className="form-control"
              placeholder="713146"
              maxLength={6}
              value={formState.pincode}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: LAND & INCOME (CONTAINS INTENTIONALLY VAGUE FIELDS) */}
      <div className="form-section" data-section="land_income">
        <h3 className="section-title">3. Land Holding & Income Category</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="farmer_category">
              Farmer Category<span className="required">*</span>
            </label>
            <select
              id="farmer_category"
              name="farmer_category"
              className="form-control"
              value={formState.farmer_category}
              onChange={handleChange}
            >
              <option value="Marginal">Marginal (&lt; 1 Hectare)</option>
              <option value="Small">Small (1 - 2 Hectares)</option>
              <option value="Large">Large (&gt; 2 Hectares)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="annual_income">
              Annual Family Income (INR)<span className="required">*</span>
            </label>
            <input
              type="number"
              id="annual_income"
              name="annual_income"
              className="form-control"
              placeholder="e.g. 120000"
              value={formState.annual_income}
              onChange={handleChange}
            />
          </div>

          {/* Vague Field 1 */}
          <div className="form-group">
            <label htmlFor="nature_of_occupancy">
              Nature of Occupancy<span className="required">*</span>
              <span className="badge-vague">Disambiguation Target</span>
            </label>
            <select
              id="nature_of_occupancy"
              name="nature_of_occupancy"
              className="form-control"
              value={formState.nature_of_occupancy}
              onChange={handleChange}
              aria-label="Nature of land occupancy title"
            >
              <option value="">-- Select Occupancy Type --</option>
              <option value="Owner">Owner</option>
              <option value="Patta Holder">Patta Holder</option>
              <option value="Recorded Bargadar">Recorded Bargadar</option>
            </select>
          </div>

          {/* Vague Field 2 */}
          <div className="form-group">
            <label htmlFor="land_holding_scale">
              Land Holding Scale (in Acres)<span className="required">*</span>
              <span className="badge-vague">Disambiguation Target</span>
            </label>
            <input
              type="text"
              id="land_holding_scale"
              name="land_holding_scale"
              className="form-control"
              placeholder="e.g. 1.25"
              value={formState.land_holding_scale}
              onChange={handleChange}
              aria-label="Total agricultural land holding scale in acres"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: DOCUMENT UPLOADS */}
      <div className="form-section" data-section="documents">
        <h3 className="section-title">4. Required Document Enclosures</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="aadhaar_doc">
              Aadhaar Card Copy (PDF/Image)<span className="required">*</span>
            </label>
            <div className="file-dropzone">
              <input type="file" id="aadhaar_doc" name="aadhaar_doc" accept="image/*,.pdf" style={{ display: 'none' }} />
              <label htmlFor="aadhaar_doc" style={{ cursor: 'pointer' }}>
                📁 Drag & drop Aadhaar Card or <strong>Browse</strong>
                <p>Accepted formats: JPG, PNG, PDF (max 2MB)</p>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="land_doc">
              RoR / Khatiyan / Porcha Copy<span className="required">*</span>
            </label>
            <div className="file-dropzone">
              <input type="file" id="land_doc" name="land_doc" accept="image/*,.pdf" style={{ display: 'none' }} />
              <label htmlFor="land_doc" style={{ cursor: 'pointer' }}>
                📁 Drag & drop Land Record or <strong>Browse</strong>
                <p>Accepted formats: JPG, PNG, PDF (max 2MB)</p>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bank_doc">
              Bank Passbook First Page<span className="required">*</span>
            </label>
            <div className="file-dropzone">
              <input type="file" id="bank_doc" name="bank_doc" accept="image/*,.pdf" style={{ display: 'none' }} />
              <label htmlFor="bank_doc" style={{ cursor: 'pointer' }}>
                📁 Drag & drop Passbook Copy or <strong>Browse</strong>
                <p>Accepted formats: JPG, PNG, PDF (max 2MB)</p>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" id="btn-portal-submit">
          Direct Submit Application (Simulator)
        </button>
      </div>
    </form>
  );
};
