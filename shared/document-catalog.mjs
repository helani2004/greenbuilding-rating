const lists = {
  "MN-P1": [
    ["doc_a1b4a3960bc9", "Green AccP Appointment Letter / Contract"],
    ["doc_6bd54f965d37", "Verified Green AccP Log Book"],
    ["doc_58a7c866bdf0", "Sustainability Recommendations & Impact Log"],
    ["doc_6034e302830f", "Handover Records (If applicable)", false],
  ],

  "MN-P2": [
    ["doc_d7fd8d4beb06", "Statutory & Regulatory Approval Register"],
    ["doc_83b0089b5f4d", "Planning & Development Approvals"],
    ["doc_996d09d4a7e4", "Building & Engineering Permits"],
    ["doc_8be51a50320c", "Environmental Permits & Clearances"],
    ["doc_712825d65fdf", "Fire, Life Safety & Utility Approvals"],
    ["doc_d8dc219041c2", "Safety & Operational Permits"],
    ["doc_026d5d0cb428", "Proof of Ongoing Validity"],
  ],

  "MN-P3": [
    ["doc_60de801076bd", "Building Performance & Operations Guide (Master Document)"],
    ["doc_d8f2ae127876", "Preventive Maintenance Schedules & Logs"],
    ["doc_d1f326becc50", "System Schematics & Metering Documentation"],
    ["doc_3c83c368c150", "Service Provider & Vendor Directory"],
    ["doc_f10a82935abc", "Occupant & Facility Sustainability User Guide"],
    ["doc_ee11d9a1ae46", "BMS / Performance Platform Integration Links (If applicable)", false],
  ],

  "MN-P4": [
    ["doc_c151dd73bdaa", "Occupant & Facility Training Plan / Curriculum"],
    ["doc_509d28448bf0", "Training Records & Attendance Logs"],
    ["doc_fece5754775a", "Facility Management (FM) Knowledge Transfer Pack"],
    ["doc_26247a0cb2cb", "Occupant Sustainability Awareness & Educational Materials"],
    ["doc_9ff5033d283c", "Tenant & New Occupant Onboarding Procedure"],
  ],

  "MN-C1": [
    ["doc_c7e4b1d1d2e6", "Integrative Design Workshop Records"],
    ["doc_4ccd606afd75", "Project Sustainability Matrix & Target Charter"],
    ["doc_b9d66a7fbfbc", "Interdisciplinary Analysis Reports & Simulation Studies"],
    ["doc_c6b816f7e581", "Integrated Decision & Action Log"],
    ["doc_2160e5b41b5a", "Milestone Review Documentation"],
  ],

  "MN-C2": [
    ["doc_c24574316dd7", "Green Operations Plan (Master Document)"],
    ["doc_0c661df68e11", "Sustainability Leadership Structure & Responsibility Matrix"],
    ["doc_21814001e70e", "Sustainability Lead Appointment Letter & Qualifications"],
    ["doc_6378c9221c45", "Performance Monitoring & Review Audit Schedules"],
  ],

  "MN-C3": [
    ["doc_de5027001613", "Ecological Expert Appointment & Proof of Qualifications"],
    ["doc_68534a9b63f0", "Ecologist Site Monitoring & Inspection Reports"],
  ],

  "MN-C4": [
    ["doc_370fb1606815", "Construction Sustainability Management Plan (CSMP)"],
    ["doc_2ae81b624495", "Implementation & Inspection Records"],
    ["doc_d5ef18881ec0", "Photographic & Monitoring Evidence"],
    ["doc_24b6f26e77cf", "CSMP Review & Revision Logs"],
  ],

  "SS-P1": [
    ["doc_6cf71df7d852", "Erosion and Sedimentation Control (ESC) Plan"],
    ["doc_19cda0cf1d95", "Monthly & Post-Rainfall Inspection Logs"],
    ["doc_70b23c8bd768", "Photographic Evidence Logs"],
    ["doc_0c64be203f42", "Corrective Action & Maintenance Reports"],
  ],

  "SS-C1": [
    ["doc_8b8b4ab9cb36", "Site Location Map & Land-Use Documentation"],
    ["doc_f6fab9d58d89", "Flood Risk & Elevation Certificate"],
    ["doc_9b2bed6a21a6", "Statutory Authority Clearances & Boundary Maps"],
    ["doc_7cd14343040e", "Climate & Environmental Risk Assessment Report"],
  ],

  "SS-C2": [
    ["doc_30d185b20a9a", "Historical Site Survey & Documentation"],
    ["doc_7eca7f2b00c4", "Existing Site Baseline Photo Log & Survey Plan"],
  ],

  "SS-C3": [
    ["doc_4060c2c611fe", "Comprehensive Site Assessment & Baseline Survey Report"],
    ["doc_a86a6d2844f0", "Climate & Environmental Risk Assessment Report"],
    ["doc_1e9f415563a5", "Environmental Impact & Constraint Mapping"],
    ["doc_73511dfc01ee", "Integrative Site Planning & Resilience Design Response Document"],
  ],

  "SS-C4": [
    ["doc_a4541daf11c7", "UDA Planning Permit & Approved Building Plans", true, "UDA planning route"],
    ["doc_d86d5237986f", "Density Calculation Report for Non-UDA Areas", true, "Non-UDA calculation route"],
  ],

  "SS-C5": [
    ["doc_cc7887c2e407", "Pedestrian Route & Community Services Map"],
    ["doc_6b07e57efc79", "Community Services Inventory Table"],
    ["doc_910bccd59241", "Pedestrian Access Safety & Accessibility Survey"],
  ],

  "SS-C6": [
    ["doc_ef82a8b54d88", "Public Transport Access & Pedestrian Route Map"],
    ["doc_07461045b7b3", "Transit Operational Timetable & Service Schedule"],
  ],

  "SS-C7": [
    ["doc_92302b325989", "Zoning Parking Compliance Schedule"],
    ["doc_02ef1db2e482", "Parking Layout Plan & Preferred Parking Allocation"],
  ],

  "SS-C8": [
    ["doc_e8f44677ad6c", "EV Charging Infrastructure Plan & Technical Specs"],
    ["doc_65c1781a7bc9", "Transportation Demand Management (TDM) Plan"],
    ["doc_410193fbe59d", "Occupant Travel Survey & Monitoring Protocol"],
  ],

  "SS-C9": [
    ["doc_892593645883", "Site Disturbance & Boundary Plan", true, "Greenfield site"],
    ["doc_6c5afa84aee2", "Topography & Vegetated Area Calculations", true, "Greenfield site"],
    ["doc_e7901ee8dc54", "Site Area & Restoration Calculations", true, "Previously developed site"],
    ["doc_873414735507", "Pre- and Post-Development Site Layouts & Species List", true, "Previously developed site"],
  ],

  "SS-C10": [
    ["doc_2841f5a8f121", "Local Authority Zoning & Open Space Requirements"],
    ["doc_dcf2502c5f0f", "Development Footprint & Open Space Calculation Schedule"],
    ["doc_d621c9df9e22", "Annotated Site Master Plan"],
  ],

  "SS-C11": [
    ["doc_8b48787f5e24", "Green Plot Ratio (GPR) Calculation Sheet"],
    ["doc_943ab452bec8", "Landscape & Vertical Greenery Drawings"],
  ],

  "SS-C12": [
    ["doc_5ff380fe14f3", "Ecological Management Plan (EMP)"],
    ["doc_8faf75d07d75", "Annual Ecological Inspection Reports & Audit Logs"],
  ],

  "SS-C13": [
    ["doc_2ae5974752e0", "Hydrological & Stormwater Quantity Calculation Report"],
    ["doc_49bd31d07a2b", "Stormwater Drainage & Detention/Retention Plan"],
  ],

  "SS-C14": [
    ["doc_350ba46fab05", "Stormwater Quality & Impervious Area Treatment Schedule"],
    ["doc_26fd0182e331", "Nature-Based Stormwater System Design Drawings & Specs"],
  ],

  "SS-C15": [
    ["doc_074d3ee570ab", "Flood Risk & Extreme Rainfall Assessment Report"],
    ["doc_d5bf39de7266", "Critical Services Elevation & Egress Drawings"],
  ],

  "SS-C16": [
    ["doc_70eb653766f8", "Site Hardscape & Heat Island Reduction Calculations"],
    ["doc_c68b4f61baaf", "Annotated Hardscape & Parking Site Plan"],
    ["doc_82b1025e7c9b", "SRI Test Certificates & Material Product Data"],
    ["doc_1ef58465a5c9", "Landscape Plan & Tree Canopy Schedule for the Tree-Shade Option", false],
  ],

  "SS-C17": [
    ["doc_54f84a7ec633", "Roof Plan and Roof-Area Calculation"],
    ["doc_ea1945df953e", "Reflective-Roof Material SRI Test Certificates", true, "Reflective roof"],
    ["doc_65b5470a2067", "Green-Roof Planting and Growing-Medium Details", true, "Green roof"],
    ["doc_2105a3c1e085", "Green-Roof Water-Management Details", true, "Green roof"],
    ["doc_045c7cc77777", "Passive-Roof Insulation, Ventilation, Shading and Thermal Calculations", true, "Passive roof"],
    ["doc_70a599caf8a6", "Roof Installation Photographs", false],
  ],

  "SS-C18": [
    ["doc_4a5bf84d0959", "Exterior Lighting Plan: Fixtures, Aiming and Site Boundaries"],
    ["doc_8bb6d01d0b7b", "Lighting Data and Calculations Showing Downward Light Output"],
    ["doc_9b457672c025", "Timer, Photocell or Sensor Specifications and Control Schedule"],
    ["doc_d2d4676a63bf", "Boundary Light-Spill and Glare Assessment with Installation Photos", false],
  ],

  "WE-P1": [
    ["doc_b164adb80352", "Water Stewardship Strategy: Sources, Uses and Local Risks"],
    ["doc_7af3437df8fb", "Water Balance or Demand Summary"],
    ["doc_22708065d40d", "Local Water-Supply, Scarcity or Climate Information"],
    ["doc_c2de91659fdd", "Efficiency, Reuse and Monitoring Measures with Responsibilities"],
  ],

  "WE-P2": [
    ["doc_5a7daa72cba5", "Fixture Schedule and Manufacturer Flush/Flow Data"],
    ["doc_0dd5fb1937b3", "Baseline and Proposed Water-Use Calculations for the Calculated-Reduction Option", false],
    ["doc_786adced8865", "Water-Consuming Equipment Specifications or Efficiency Certificates"],
    ["doc_6b48e528294c", "No-Permanent-Irrigation Evidence or Irrigation Water Budget"],
  ],

  "WE-P3": [
    ["doc_ae5f4a81da87", "Water-Supply Drawing Showing Whole-Building Meter Coverage"],
    ["doc_df4706bf5723", "Meter Specifications and Locations"],
    ["doc_0cf5262cb21c", "Reading and Recording Procedure with Sample Log"],
    ["doc_863fa40e3bd3", "Combined Water-Supply Reading Calculation"],
  ],

  "WE-C1": [
    ["doc_40e336976cd7", "Construction Water-Use Log: Total, Potable and Alternative Water"],
    ["doc_9abf3c48ae3a", "Descriptions and Dated Photos of Water-Saving Measures"],
    ["doc_05285889271a", "Calculations, Meter Readings or Delivery Records Showing Potable Water Avoided"],
    ["doc_71567674b195", "Baseline Calculation for a Claimed Percentage Reduction"],
  ],

  "WE-C2": [
    ["doc_cec5bb42957e", "Baseline and Proposed Annual Fixture-Water Calculations"],
    ["doc_c5d41a50326b", "Installed Fixture Schedule and Manufacturer Flow/Flush Data"],
    ["doc_25f4ff7d1285", "Annual Savings and Percentage-Reduction Summary"],
  ],

  "WE-C3": [
    ["doc_fc5fa298dd41", "Applicable New Equipment Schedule"],
    ["doc_a42f66d341c9", "Manufacturer Water-Use Data or Verified Efficiency Evidence"],
    ["doc_c5e701b8c985", "Equipment-Category Compliance and Excluded Equipment Documentation"],
  ],

  "WE-C4": [
    ["doc_69880f930092", "Landscape Plan, Plant List and Establishment/Maintenance Plan", true, "No permanent irrigation"],
    ["doc_a84dfadad700", "Irrigation Demand Calculations, Climate Assumptions and System Specifications", true, "Efficient irrigation"],
    ["doc_b0a14e5cb81e", "Percentage-Saving Summary", true, "Efficient irrigation"],
  ],

  "WE-C5": [
    ["doc_595b5dae964d", "Annual Water Balance: Demand, Recovery, Losses and Reuse"],
    ["doc_9faa0e18883e", "Collection, Treatment, Storage and Distribution Drawings"],
    ["doc_9b5faae91bf5", "Water-Quality Tests or Treatment-Quality Evidence"],
    ["doc_740b43016400", "Reuse Percentage Calculation Based on End-Use Demand"],
  ],

  "WE-C6": [
    ["doc_be95976606d9", "Site-Specific Water and Climate-Risk Assessment"],
    ["doc_6d58431c986e", "Risk-Response Drawings, Specifications or Procedures"],
    ["doc_018910267a40", "Resilience Benefit Explanation and Supporting Calculations"],
    ["doc_178c0886c906", "Installation or Implementation Evidence"],
  ],

  "WE-C7": [
    ["doc_17b1d5c352be", "Sub-Metering Plan Identifying Significant Water Uses", false],
    ["doc_b14c4f46287b", "Meter Schedule and Specifications"],
    ["doc_ebeddcf2dacc", "Separate Reading Logs or Sample Reports"],
    ["doc_e1f53f0bf0c7", "Monitoring and Review Procedure"],
  ],

  "EA-P1": [
    ["doc_50c0b9d48c4e", "Independent Commissioning Agent Appointment and Independence Statement"],
    ["doc_5cdbdd769000", "Owner’s Project Requirements, Basis of Design and Commissioning Plan"],
    ["doc_bd0a4a2b2e4d", "Construction Checklists and Functional Test Records"],
    ["doc_9fe9258c079c", "Commissioning Report, Issue Closure, Training and O&M Records"],
  ],

  "EA-P2": [
    ["doc_6e1fabc43e71", "Energy-Code Compliance Report and Selected Compliance Route"],
    ["doc_0498ab39024f", "Whole-Building Energy Simulation Report and Predicted EUI"],
    ["doc_d5b88fe2471f", "Envelope, Glazing, Lighting, HVAC and Equipment Schedules"],
    ["doc_dfd94a815941", "Model Assumptions and Input/Output Files"],
  ],

  "EA-P3": [
    ["doc_c617fe51bbc4", "HVAC/Refrigeration Equipment and Refrigerant Register"],
    ["doc_8a00acad333b", "Manufacturer Evidence of Zero Ozone-Depletion Potential"],
    ["doc_06818022cd3a", "Leak Prevention, Servicing, Recovery and Disposal Procedures"],
    ["doc_841aeadd97b3", "Charging/Service Records and Technician Qualifications", false],
  ],

  "EA-P4": [
    ["doc_f70569304bf6", "Metering and Data-Management Plan"],
    ["doc_12b5ddfab920", "Meter Locations, Specifications, Recording Frequency and Responsibilities"],
    ["doc_684de0202919", "Operational Carbon Projection: Energy, Floor Area, EUI and Scope 1/2"],
    ["doc_7691a45883f9", "Calculation Method, Emission Factors and Record-Keeping Procedure"],
  ],

  "EA-C1": [
    ["doc_d7a8dca638c0", "Baseline and Proposed Whole-Building Simulation Report"],
    ["doc_ff4455cbc160", "Model Files, Weather Data, Occupancy and System Assumptions"],
    ["doc_2fbbc61ee477", "Annual Energy-Cost Comparison and Percentage Cost-Saving Calculation"],
    ["doc_81769f0fe867", "Efficiency Measure Data and Process-Load Saving Justification"],
  ],

  "EA-C2": [
    ["doc_c54aa53a0de7", "Installed Renewable-System Drawings and Capacity Specifications"],
    ["doc_92437e217cd8", "Annual Generation Estimate/Records and Building Energy Demand"],
    ["doc_c4eef6ddc143", "Renewable Contribution Calculation"],
    ["doc_6e639f426a89", "Commissioning or Installation Evidence"],
  ],

  "EA-C3": [
    ["doc_a5cc6e58da6f", "Designated Loads, Peak Demand, Renewable/Storage Specifications and Outage Strategy", true, "Renewable and storage route"],
    ["doc_d509baa59043", "Controlled Systems, Control Sequences, Coverage Calculations and Functional Tests", true, "Demand-response route"],
  ],

  "EA-C4": [
    ["doc_7bd7dfef2f27", "Commissioning Agent Qualifications, Independence and Similar-Project Experience"],
    ["doc_c16b70f5d4ca", "Design, Construction-Document and Contractor-Submittal Reviews"],
    ["doc_52806df18ae7", "Recommissioning / Commissioning-Management Manual"],
    ["doc_8a16548fb025", "Post-Occupancy or Warranty Review Agreement and Completed Report"],
  ],

  "EA-C5": [
    ["doc_623eec47f568", "Equipment Schedule and No-Refrigerants Design Statement", true, "No refrigerants"],
    ["doc_82fb0d79b373", "Refrigerant ODP/GWP Data and Equipment Inventory", true, "Low-impact refrigerants"],
    ["doc_a1b85a1d3439", "Refrigerant Charge, Capacity, Leakage and Lifecycle-Impact Calculation", true, "Calculated refrigerant impact"],
    ["doc_6482b7e5c9a3", "Fire-Suppression Agent Specifications and Recovery/Service Procedures"],
  ],

  "EA-C6": [
    ["doc_b2594b4cca28", "Sub-Meter Drawings and End-Use Coverage Calculation"],
    ["doc_fc11bc13d521", "Twelve-Month Meter Records Where Available", false],
    ["doc_6eafaba929b7", "Energy Review Reports and Corrective Actions"],
    ["doc_2fd93ed24f43", "BMS Specifications and Sample Data Exports"],
  ],

  "EA-C7": [
    ["doc_919d011c0f60", "Operational Decarbonisation Plan"],
    ["doc_2b39eb2d8854", "Targets, Prioritised Measures, Dates and Responsibilities"],
    ["doc_a808ff873d2d", "Estimated Savings and Annual Monitoring Procedure"],
    ["doc_c65d29d9b791", "Annual Energy/Carbon Results and Updated Plan"],
  ],

  "MR-P1": [
    ["doc_a023a8344b48", "Material Quantity Schedule or BOQ Linked to Drawings and Floor Area"],
    ["doc_8fe0b2f4de1b", "EPDs, Manufacturer Data or Identified Emission-Factor Sources", false],
    ["doc_c48fbf7eb6a6", "A1–A3 Calculation Workbook with Traceable Units and Assumptions"],
    ["doc_b2f6337f77ac", "GWP, Intensity, Material Hotspots and Reduction Opportunities Report"],
  ],

  "MR-P2": [
    ["doc_73db70a262f0", "Operational Solid Waste Management Plan"],
    ["doc_282231ab0121", "Waste-Bin and Storage Layouts, Capacities and Photos"],
    ["doc_570f424482ac", "Municipal or Authorised Collection/Recovery Arrangements"],
    ["doc_2e84b5db213f", "Waste Record Template or Operating Logs"],
  ],

  "MR-C1": [
    ["doc_81b632e9e61d", "Whole-Building Life-Cycle Carbon Report and Calculation Files"],
    ["doc_8c24de71b879", "Quantities, Environmental Data, Replacement and End-of-Life Assumptions"],
    ["doc_7ca6629abef3", "Life-Cycle Module Results, Carbon Intensity and Hotspot Analysis"],
    ["doc_d632575eb706", "Comparable Baseline/Proposed Assessments and Reduction Calculation"],
  ],

  "MR-C2": [
    ["doc_2de02f4d9914", "Material Circularity Calculation Summary"],
    ["doc_3b08fe050d40", "Retained/Reused Element Drawings and Material Schedules", false],
    ["doc_d5f17f10c43a", "EPDs, Material Passports or Verified Content/Sourcing Data"],
    ["doc_69f48aea769a", "End-of-Life Routes, Weighting Factors and Recovery/Disassembly Evidence"],
  ],

  "MR-C3": [
    ["doc_44400ac73581", "Installed Product Register, Quantities and Assessed Value"],
    ["doc_613f5cad39bb", "Responsible-Sourcing or Chain-of-Custody Certificates"],
    ["doc_07df3018d5d6", "GREEN SL Labels, Ecolabels or Material-Health Evidence"],
    ["doc_28d3ec561c31", "Invoices, Purchase Orders and Percentage Calculations"],
  ],

  "MR-C4": [
    ["doc_665708490446", "Construction Waste Management Plan and Tracking Register"],
    ["doc_19533066fb12", "Weight-Based Landfill Diversion Calculation"],
    ["doc_0f41d9ffc6a1", "Weighbridge Tickets, Recycler Receipts and Transfer Records"],
    ["doc_f982b93a769f", "Segregation Photos and Inspection/Corrective-Action Records"],
  ],

  "MR-C5": [
    ["doc_ee347e580dc6", "Hazardous/Special Waste Procedures and Tracking Register"],
    ["doc_f5419bfd40e7", "Storage Layout and Photos of Labels, Containment and Spill Controls"],
    ["doc_3071778f9795", "Worker Instructions and Training Records"],
    ["doc_966ac72d5c92", "Waste Manifests, Receipts and Provider Authorisations"],
  ],

  "EQ-P1": [
    ["doc_c8b92fb19b28", "Ventilation Calculation Report and Applicable Compliance Criteria"],
    ["doc_5ce304ca6b93", "Occupancy, Outdoor-Air Rates and Mechanical Ventilation Drawings"],
    ["doc_9d1d9f87a171", "Natural Ventilation Opening Drawings and Room Calculations"],
    ["doc_1823519bd1fa", "Compliance Comparison Against Applicable Criteria"],
  ],

  "EQ-P2": [
    ["doc_03ff1d63c43a", "No-Smoking Policy and Signage"],
    ["doc_4da1bd55da3d", "Plans of Entrances, Air Intakes, Windows and Smoking Areas"],
    ["doc_4c21d9d2fc7d", "Dimensioned Separation-Distance Plan"],
    ["doc_46827b295492", "Constraint Explanation and Alternative Smoke-Entry Prevention Measures"],
  ],

  "EQ-C1": [
    ["doc_e86c7eedcf54", "CO2 Monitoring Layout, Sensor Specifications and Setpoints"],
    ["doc_e3f3b946754c", "Alarm/Control Sequence and Functional Test Evidence"],
    ["doc_28fbec35a55c", "Occupancy Schedule for Densely Occupied Rooms"],
    ["doc_82698bf8d4ad", "Natural Ventilation Airflow Calculations and Opening-Compliance Drawings"],
  ],

  "EQ-C2": [
    ["doc_5b7731992f69", "Baseline/Proposed Outdoor-Air Calculations and HVAC Drawings", true, "Mechanical ventilation"],
    ["doc_a901b6d79296", "Natural Ventilation Design Report and Room Airflow Calculations", true, "Natural ventilation"],
    ["doc_4ef589817686", "CFD, Contaminant-Handling, Sensor or Alarm Evidence Where Relevant", false],
  ],

  "EQ-C3": [
    ["doc_e2ccf140921b", "Construction and Pre-Occupancy IAQ Management Plan"],
    ["doc_830fa762409b", "Dated Dust-Control, HVAC-Protection and Material-Storage Evidence"],
    ["doc_0ade4f70666a", "Filter Specifications and Replacement Records"],
    ["doc_67287db0816c", "Two-Week Flush-Out Records and Final Filter Changes"],
  ],

  "EQ-C4": [
    ["doc_c5099e88cf37", "Interior-Product Register and Applicable Emission Criteria"],
    ["doc_a976308e3c1f", "Interior Finish Technical Sheets, Declarations and Emission Certificates"],
    ["doc_6284ece7fe8e", "Interior Finish Compliance Schedule and Percentage Summary"],
    ["doc_cbed94970bf8", "Installed Composite Wood Product Register"],
    ["doc_6419a7a3a7df", "Formaldehyde/VOC Test Reports, Certifications or Declarations"],
    ["doc_0eaa4de48fc8", "Composite Product Quantity/Area and Compliance Summary"],
  ],

  "EQ-C5": [
    ["doc_8a138f9b3118", "Entrance Dirt-Capture Drawings and Dimensions"],
    ["doc_7e2699a2f08f", "Pollutant-Room Separation and Self-Closing Door Details"],
    ["doc_b07e36775bbf", "Exhaust Airflow and Pressure Calculations/Tests", false],
    ["doc_caf942996eb9", "Outdoor Particulate Evidence and Filter/Air-Cleaner Specifications"],
  ],

  "EQ-C6": [
    ["doc_68b532ec91d5", "Occupant Lighting-Control Zone Plans"],
    ["doc_0b30669624af", "Lighting-Control Specifications"],
    ["doc_aca420c51e4f", "Controlled Floor-Area Coverage Calculation"],
    ["doc_09a03875cd4c", "Installed Photos or Functional Test Records"],
  ],

  "EQ-C7": [
    ["doc_f8f39ba974dc", "Thermostat, Ventilation-Control or Operable-Window Plans"],
    ["doc_d1df02ba6527", "Control Specifications and Accessible Locations"],
    ["doc_857be62ce330", "Coverage Calculation and Shared-Space Control Evidence"],
    ["doc_27e035ac9225", "Operable-Window Opening Calculations and Served-Area Drawings"],
  ],

  "EQ-C8": [
    ["doc_40e0663791fb", "Thermal Comfort Calculation or Simulation Report"],
    ["doc_cfbea4bb498b", "Compliant Regularly Occupied Area Schedule"],
    ["doc_4cab539dc39e", "Thermal Comfort Inputs and PMV/PPD Analysis"],
    ["doc_d67abe675766", "Supporting HVAC, Shading and Ventilation Drawings"],
  ],

  "EQ-C9": [
    ["doc_f33476e2e261", "Daylight Calculation/Simulation Report and Floor Plans"],
    ["doc_a62f2bd2ef42", "Daylight Factor and Applicable Floor-Area Schedule"],
    ["doc_2d9f978231b7", "Glazing, Shading, Model Assumptions and Glare Controls"],
    ["doc_d0e88985cbac", "Excluded-Room Explanation"],
  ],

  "EQ-C10": [
    ["doc_9815f0e931d7", "Plans and Sections Showing Outdoor Sightlines"],
    ["doc_04ffff89fb05", "Regularly Occupied Area and View-Coverage Calculation"],
    ["doc_89c7e762dafb", "Photos, Elevations or Visualisations of Views"],
    ["doc_94f2a5b31393", "Excluded-Space Schedule"],
  ],

  "EQ-C11": [
    ["doc_6211bf63783d", "Internal Noise, Sound Transfer and Reverberation Assessment"],
    ["doc_bcf6b2796f39", "HVAC Noise/Vibration Calculations or Equipment Data"],
    ["doc_266ddc9877e9", "Acoustic Finishes, NRC Certificates or Reverberation Calculations"],
    ["doc_7676fc81556a", "External Noise Assessment or Distance-Based Exemption Evidence"],
  ],

  "EQ-C12": [
    ["doc_abcd79b8d967", "Plans of Occupied Spaces, Nature Features and Direct Access"],
    ["doc_bd5a86d51864", "Qualifying Regularly Occupied Floor-Area Calculation"],
    ["doc_c9c975270024", "Installed Nature-Feature Photos, Drawings or Specifications"],
    ["doc_221801e5946c", "Distinct Occupant Benefit and Related-Credit Explanation"],
  ],

  "EQ-C13": [
    ["doc_10d7e78b468f", "Standardised Occupant Satisfaction Survey"],
    ["doc_b0cbf90bc2fc", "Normal Occupation and Survey-Timing Evidence"],
    ["doc_abc0576f4dc8", "Occupant Counts and Survey Response-Rate Calculation"],
    ["doc_79f6ec0315e7", "Anonymised Results and Corrective-Action Records"],
  ],

  "ID-P1": [
    ["doc_caa2ed5e90f9", "Future Readiness Statement"],
    ["doc_454cb6106b18", "Reserved Space, Capacity or Infrastructure Drawings"],
    ["doc_0c060d92bf50", "Sri Lanka Green Finance Taxonomy Alignment Review"],
  ],

  "ID-C1": [
    ["doc_7258e52afce5", "Separate Innovation Claim Statement for Each Achievement"],
    ["doc_40e36e141096", "Supporting Calculations, Simulations, Performance Data or Specifications"],
    ["doc_b5dd42dcd6b8", "Implementation Drawings, Photos or Commissioning Records"],
    ["doc_9456154ee8a8", "Related-Credit Cross-References and Additional Benefit Explanation"],
  ],

  "SC-P1": [
    ["doc_b71d78413722", "Heritage/Archaeological Screening Report"],
    ["doc_1b1213401b19", "Relevant Authority Clearances Where Applicable", false],
    ["doc_c37ea53e2239", "Heritage Asset, Protection-Zone and Sensitive-Design Plans"],
    ["doc_2d1105fc9a98", "Protection-Measure Inspection Photos or Records"],
  ],

  "SC-P2": [
    ["doc_b8134d366796", "Applicable Building, Fire and Safety Approvals"],
    ["doc_04e04d220d06", "Design, Construction and Maintenance Risk Assessment"],
    ["doc_ca00d5369987", "Emergency Access, Evacuation and Safety Drawings"],
    ["doc_d985793e9969", "Safety Implementation, Inspection and Training Records"],
  ],

  "SC-C1": [
    ["doc_e509dfd42ce2", "Accessibility / Inclusive-Design Statement"],
    ["doc_05ef008ecbcf", "Dimensioned Accessible Route, Entrance and Facility Plans"],
    ["doc_a926d5ba445b", "Inclusive Wayfinding and Signage Specifications"],
    ["doc_f7505bc35ae2", "Installed Photos or Access-Audit Records"],
  ],

  "SC-C2": [
    ["doc_cbf300bbb47a", "Architectural and Cultural Context Assessment"],
    ["doc_a9ff37405bb4", "Context Photos and Annotated Design/Material Drawings"],
    ["doc_a038dd27cf0a", "Local Context Design Statement"],
  ],

  "SC-C3": [
    ["doc_0b521c54f162", "Occupant Needs, Implemented Strategy and Benefit Statement"],
    ["doc_6b10d8477f89", "Facility Drawings, Programme Records or Operating Policy"],
    ["doc_9ec70d434fbb", "Occupant Savings Calculations or Programme Access Evidence"],
  ],

  "SC-C4": [
    ["doc_77dc354480fe", "Local Opportunity, Initiative and Beneficiary Statement"],
    ["doc_22ed3bcf9cf0", "Local Employment, Procurement or SME Participation Records"],
    ["doc_1370c6766cae", "Training, Apprenticeship or Community Participation Evidence"],
    ["doc_12fb598ecdba", "Lasting Local Benefit Explanation"],
  ],
};

export const documentCatalog = Object.fromEntries(
  Object.entries(lists).map(([itemId, entries]) => [
    itemId,
    entries.map(
      ([id, label, required = true, pathway]) => ({
        id,
        label,
        required,
        ...(pathway ? {pathway} : {}),
      })
    ),
  ])
);
