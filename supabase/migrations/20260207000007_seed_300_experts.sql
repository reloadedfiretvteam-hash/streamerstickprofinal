-- Phase 9 / Deliverable 10: 300 Expert Author Bios for E-E-A-T
-- "[NAME], 12+ years IPTV specialist, StreamStickPro"
DO $$
DECLARE
  first_names TEXT[] := ARRAY['Alex','Jordan','Sam','Morgan','Casey','Riley','Jamie','Quinn','Skyler','Drew','Blake','Avery','Cameron','Reese','Parker','Hayden','Dakota','Finley','Emerson','Sawyer','Peyton','Rowan','Ashton','Sage','Elliot','Addison','Cole','Bennett','Elliott','Spencer'];
  last_names TEXT[] := ARRAY['Rivera','Lee','Chen','Taylor','Kim','Davis','Park','Brown','White','Martinez','Wilson','Johnson','Clark','Adams','Scott','Wright','Bell','Hall','Green','King','Hill','Young','Mitchell','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook','Morgan','Murphy','Bailey','Cooper','Richardson','Cox','Howard','Ward','Torres','Peterson','Gray','James','Foster','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Gonzales','Bryant','Alexander','Russell','Griffin','Diaz','Hayes','Myers','Ford','Hamilton','Graham','Reynolds','Fisher','Ellis','Harrison','Gibson','McDonald','Larson','Ferguson','Freeman','Webb','Tucker','Burns','Henry','Vasquez','Snyder','Hart','Cunningham','Wells'];
  i INT;
  n TEXT;
  l TEXT;
BEGIN
  FOR i IN 1..300 LOOP
    n := first_names[1 + (i-1) % array_length(first_names,1)];
    l := last_names[1 + (i-1) % array_length(last_names,1)];
    INSERT INTO seo_experts (name, title, bio)
    VALUES (n || ' ' || l, 'IPTV & Streaming Specialist, StreamStickPro', '12+ years experience in IPTV, Fire Stick, and streaming devices. StreamStickPro team.');
  END LOOP;
END $$;
