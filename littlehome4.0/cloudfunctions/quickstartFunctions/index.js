const cloud = require("wx-server-sdk");
const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 读取配置文件
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));



// 获取openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 上传头像到COS
const uploadAvatarToCOS = async (fileBuffer, fileName) => {
  const bucketName = config.cos.bucketName;
  const region = config.cos.region;
  const folder = config.cos.folder;
  const key = `${folder}/${fileName}`;
  
  console.log('开始上传头像到COS:', {
    bucketName,
    region,
    key,
    fileSize: fileBuffer.length
  });
  
  try {
    const result = await cos.putObject({
      Bucket: bucketName,
      Region: region,
      Key: key,
      Body: fileBuffer,
      ContentType: 'image/jpeg',
    });
    
    const url = `https://${bucketName}.cos.${region}.myqcloud.com/${key}`;
    console.log('头像上传成功:', url);
    
    return {
      success: true,
      url: url,
      etag: result.ETag,
    };
  } catch (error) {
    console.error('上传到COS失败:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('云函数调用:', event.type, event);
  
  switch (event.type) {
    case "getOpenId":
      return await getOpenId();
    case "uploadAvatar":
      try {
        const { fileBuffer, fileName } = event;
        if (!fileBuffer || !fileName) {
          return {
            success: false,
            error: '缺少必要参数: fileBuffer 或 fileName'
          };
        }
        const uploadResult = await uploadAvatarToCOS(fileBuffer, fileName);
        return uploadResult;
      } catch (error) {
        console.error('头像上传处理失败:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    default:
      return { errMsg: "Unknown event type" };
  }
};
