
function VersionInfoMobile({ callAPI, redirect, customAlert }) {
  return (
    <div className="container pt-2 pb-4">
      <div className="row h1">
        <p>Version Info (Mobile)</p>
      </div>
      <div className="h3">
        1.0.1 <br />
        &nbsp;&nbsp;- แสดงเลข Prospect ID ในเมนู Other Prospect<br />
        &nbsp;&nbsp;- Sale Territory : แก้ให้สามารถเพิ่ม Dedicate Territory แบบ Multi Select ได้<br />
        &nbsp;&nbsp;- กดรูปเป้า แล้วเอาค่า Lat/Long มาใส่ในหน้า Basic ตอนแก้ไข ให้สามารถ Save ได้
      </div>
      <div className="h3">
        1.0.3 <br />
        &nbsp;&nbsp;- จดมิเตอร์ กับ Stock Card ตอนทำ Sale Visit จดจำค่าไว้ กรณียังจดไม่เสร็จสิ้น<br />
        &nbsp;&nbsp;- Stock Card ตอนทำ Sale Visit dafault ค่าเป็น 0<br />
        &nbsp;&nbsp;- แก้ไข call service calendar โดยส่ง parameter calendar เพิ่ม ของหน้า Home และ Sale Visit Plan<br />
        &nbsp;&nbsp;- แก้ไข Notification หน้า Home แสดงตามเดือนของ calendar ด้านล่าง<br />
        &nbsp;&nbsp;- แก้ไขปัญหาตอนจดมิเตอร์ พร้อมถ่ายรูปแล้ว Application เด้ง<br />
        &nbsp;&nbsp;- แก้ไขเรื่อง filter ตอน add DDL prospect/customer<br />
        &nbsp;&nbsp;- แก้ไขเรื่องสร้าง plan โดยมี เฉพาะ location ได้
      </div>
    </div>

  )
}


export default VersionInfoMobile