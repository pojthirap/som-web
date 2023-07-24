
function Home({ callAPI, redirect, customAlert }) {

  return (
    <div className="pl-4 pt-2 pb-4">
      <div className="row h1">
        <p>Version Info</p>
      </div>
      <div className="h3">
        1.0.0 - เพิ่มเลข version และหน้า Version Info
      </div>
      <div className="h3">
        1.0.1 - แก้ไขการ Mapping ตำบล โดยสามารถใช้ชื่อตำบลซ้ำแต่อยู่คนล่ะอำเภอได้
      </div>
      <div className="h3">
        1.0.2 - เปลี่ยนการเก็บและการใช้ Token Auth เป็นแบบ HTTPONLY
      </div>
      <div className="h3">
        1.0.2 <br />
        &nbsp;&nbsp;- เปลี่ยนการเก็บและการใช้ Token Auth เป็นแบบ HTTPONLY<br />
        &nbsp;&nbsp;- ทำหน้าจอเพื่อให้เลือกพิมพ์ QR Code ทั้งหมดของ Customer ที่เลือกในรูปแบบของ A4 (หลายๆ QR อยู่ใน A4 ตามจำนวนที่กำหนด เพื่อเอาไป Print)
      </div>
      <div className="h3">
        1.0.3 - ในส่วนของ Customer, Company, Prospect, Employee ทุก Drop Down ใน SOM ให้แสดงทั้ง ชื่อและCode และสามรถ Search ด้วย Code หรือชื่อก็ได้
      </div>
    </div>
  )
}


export default Home