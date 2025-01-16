const axios = require("axios");
const fs = require("fs");

require("dotenv").config();

const GHN_BASE_URL =
  "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data";

const GHN_TOKEN = process.env.GHN_TOKEN;

const headers = {
  token: GHN_TOKEN,
};

console.log(headers);

//Lay danh sach provinces

async function fetchProvinces() {
  const response = await axios.post(
    `${GHN_BASE_URL}/province`,
    {},
    { headers }
  );
  return response.data.data || [];
}

// Hàm lấy danh sách Districts theo mã Province
async function fetchDistricts(provinceId) {
  const response = await axios.post(
    `${GHN_BASE_URL}/district`,
    { province_id: provinceId },
    { headers }
  );
  return response.data.data || [];
}

// Hàm lấy danh sách Wards theo mã District
async function fetchWards(districtId) {
  const response = await axios.post(
    `${GHN_BASE_URL}/ward`,
    { district_id: districtId },
    { headers }
  );
  return response.data.data || [];
}

function saveDataToFile(filename, data){
    fs.writeFileSync(`./data/${filename}`, JSON.stringify(data,null,2));
    console.log(`Đã lưu dữ liệu vào file: ${filename}`);
    
}

async function fetchAndSave() {
    try {
        console.log("Đang lấy danh sách tỉnh thành phố...");
        const provinces = await fetchProvinces();
        saveDataToFile("provinces.json", provinces);
        
        const allDistricts = [];
        const allWards = [];

        for (const province of provinces){
            console.log(`Đang lấy dữ liệu quận huyện của thành phố:  ${province.ProvinceName}`);
            const districts = await fetchDistricts(province.ProvinceID);
            allDistricts.push(...districts);

            for(const district of districts){
                console.log(`Đang lấy dữ liệu phường xã của quận huyện: ${district.DistrictName}`);
                const wards = await fetchWards(district.DistrictID);
                allWards.push(...wards);
            }
            
        }

        saveDataToFile("districts.json", allDistricts);
        saveDataToFile("wards.json", allWards);

        console.log("Hoàn tất!");
        

    } catch (error) {
        console.error("Lỗi xảy ra: ", error.response?.data || error.message);
    }
}

fetchAndSave();