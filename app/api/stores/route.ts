import { NextResponse } from 'next/server';
import { Store } from '@/components/StoreCard';

// Sample data - in a real app, this would come from a database or external API
const sampleStores: Store[] = [
  {
    shopId: 34,
    storeStatus: "OPEN",
    waitingGroup: 62,
    storeQueue: ["265", "266", "267"],
    timestamp: "2025-08-17T18:35:23.683+08:00",
    name: "香港仔利港商場店",
    nameEn: "Aberdeen Port Centre Shopping Arcade",
    address: "香港香港仔成都道38號利港商場3樓301號舖",
    region: "香港島",
    area: "南區"
  },
  {
    shopId: 42,
    storeStatus: "OPEN",
    waitingGroup: 28,
    storeQueue: ["301", "302"],
    timestamp: "2025-08-17T18:32:15.421+08:00",
    name: "銅鑼灣時代廣場店",
    nameEn: "Causeway Bay Times Square",
    address: "香港銅鑼灣勿地臣街1號時代廣場地庫1樓B108號舖",
    region: "香港島",
    area: "灣仔區"
  },
  {
    shopId: 58,
    storeStatus: "CLOSED",
    waitingGroup: 0,
    storeQueue: [],
    timestamp: "2025-08-17T18:00:00.000+08:00",
    name: "旺角朗豪坊店",
    nameEn: "Mong Kok Langham Place",
    address: "九龍旺角亞皆老街8號朗豪坊14樓1401號舖",
    region: "九龍",
    area: "油尖旺區"
  },
  {
    shopId: 72,
    storeStatus: "OPEN",
    waitingGroup: 95,
    storeQueue: ["401", "402", "403", "404", "405"],
    timestamp: "2025-08-17T18:40:10.892+08:00",
    name: "沙田新城市廣場店",
    nameEn: "Sha Tin New Town Plaza",
    address: "新界沙田新城市廣場第1期地下G041號舖",
    region: "新界",
    area: "沙田區"
  },
  {
    shopId: 89,
    storeStatus: "OPEN",
    waitingGroup: 15,
    storeQueue: ["501"],
    timestamp: "2025-08-17T18:38:44.256+08:00",
    name: "中環國際金融中心店",
    nameEn: "Central IFC Mall",
    address: "香港中環金融街8號國際金融中心商場2樓2062號舖",
    region: "香港島",
    area: "中西區"
  },
  {
    shopId: 103,
    storeStatus: "OPEN",
    waitingGroup: 42,
    storeQueue: ["601", "602", "603"],
    timestamp: "2025-08-17T18:36:17.734+08:00",
    name: "尖沙咀海港城店",
    nameEn: "Tsim Sha Tsui Harbour City",
    address: "九龍尖沙咀廣東道3-27號海港城海運大廈地下G-K002號舖",
    region: "九龍",
    area: "油尖旺區"
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      success: true,
      data: sampleStores,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stores' 
      },
      { status: 500 }
    );
  }
}
