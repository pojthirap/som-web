
function VersionInfo({ callAPI, redirect, customAlert }) {
  return (
    <div className="container pt-2 pb-4">
      <div className="row h1">
        <p>Version Info</p>
      </div>
      <div className="h3">
        1.0 - แสดง ShipTo เมื่อเพิ่มข้อมูลจาก Quation No.
      </div>
      <div className="h3">
        1.0.1 - ให้ Edit เปิดให้แก้ไข lat , long ในหน้า basic
      </div>
      <div className="h3">
        1.0.2 - แก้ endpoint
      </div>
      <div className="h3">
        1.0.3 - แก้ให้ redirect กลับไปหน้า ปั้มเช่าเมื่อเปลี่ยน switch customer
      </div>
      <div className="h3">
        1.0.4 - เปลี่ยนจากการใช้ Field Tax No. ไปเป็น VAT No. โดย VAT No. มี 20 digits
      </div>
      <div className="h3">
        1.0.7 - แก้ไข wording หน้า DBD จาก Tax Number เป็น Vat Number
      </div>
      <div className="h3">
        1.0.8 <br />
        &nbsp;&nbsp;- เปลี่ยนการเก็บและการใช้ Token Auth เป็นแบบ HTTPONLY<br />
        &nbsp;&nbsp;- ทำหน้าจอเพื่อให้เลือกพิมพ์ QR Code ทั้งหมดของ Customer ที่เลือกในรูปแบบของ A4 (หลายๆ QR อยู่ใน A4 ตามจำนวนที่กำหนด เพื่อเอาไป Print)
      </div>

      <div className="h3">
        1.0.9 <br />
        &nbsp;&nbsp;- แสดงเลข Prospect ID ในเมนู Other Prospect<br />
        &nbsp;&nbsp;- Sale Territory : แก้ให้สามารถเพิ่ม Dedicate Territory แบบ Multi Select ได้
      </div>
      <div className="h3">
        1.0.10 - ในส่วนของ Customer, Company, Prospect, Employee ทุก Drop Down ใน SOM ให้แสดงทั้ง ชื่อและCode และสามรถ Search ด้วย Code หรือชื่อก็ได้
      </div>
      <div className="h3">
        1.0.11 <br />
        &nbsp;&nbsp;- แก้ไขเรื่อง filter ตอน add DDL prospect/customer<br />
        &nbsp;&nbsp;- แก้ไขเรื่องสร้าง plan โดยมี เฉพาะ location ได้
      </div>
    </div>

  )
}


export default VersionInfo