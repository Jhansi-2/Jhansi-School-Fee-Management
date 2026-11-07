const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(n||0));
const dateText = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}) : "—";
let students=[], fees=[], payments=[], modalMode="", editingId=null;
$("today").textContent = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});

async function api(url, options={}) {
  const response = await fetch(url,{headers:{"Content-Type":"application/json"},...options});
  const data = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function showError(err){toast(err.message || "Something went wrong")}
function emptyRow(cols,msg="No records found"){return `<tr><td colspan="${cols}" class="empty">${msg}</td></tr>`}
function status(balance,paid){return Number(balance)<=0?'<span class="status paid">Paid</span>':Number(paid)>0?'<span class="status partial">Partial</span>':'<span class="status pending">Pending</span>'}

async function loadAll(){
  try{
    [students,fees,payments]=await Promise.all([api("/api/students"),api("/api/fees"),api("/api/payments")]);
    renderStudents();renderFees();renderPayments();populateSelects();await loadDashboard();
  }catch(e){showError(e)}
}
async function loadDashboard(){
  const d=await api("/api/dashboard");
  $("stat-students").textContent=d.students;
  $("stat-fees").textContent=money(d.fees);
  $("stat-collected").textContent=money(d.collected);
  $("stat-pending").textContent=money(d.pending);
}
function renderStudents(){
  const q=($("student-search").value||"").toLowerCase();
  const rows=students.filter(s=>[s.name,s.class_name,s.phone,s.email].join(" ").toLowerCase().includes(q));
  $("students-body").innerHTML=rows.map(s=>`<tr><td>#${s.student_id}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.class_name)}</td><td>${esc(s.phone||"—")}</td><td>${esc(s.email||"—")}</td><td>${money(s.assigned_fees)}</td><td>${money(s.paid_amount)}</td><td><button class="action-btn" onclick="editStudent(${s.student_id})">Edit</button><button class="action-btn danger" onclick="deleteStudent(${s.student_id})">Delete</button></td></tr>`).join("")||emptyRow(8);
}
function renderFees(){
  $("fees-body").innerHTML=fees.map(f=>`<tr><td>#${f.fee_id}</td><td><b>${esc(f.student_name)}</b><br><small>${esc(f.class_name)}</small></td><td>${esc(f.academic_year)}</td><td>${esc(f.fee_type)}</td><td>${money(f.total_amount)}</td><td>${money(f.amount_paid)}</td><td><b>${money(f.balance)}</b></td><td>${dateText(f.due_date)}</td><td>${status(f.balance,f.amount_paid)}</td><td><button class="action-btn danger" onclick="deleteFee(${f.fee_id})">Delete</button></td></tr>`).join("")||emptyRow(10);
}
function renderPayments(){
  $("payments-body").innerHTML=payments.map(p=>`<tr><td><b>${esc(p.receipt_no)}</b></td><td>${esc(p.student_name)}</td><td>${esc(p.fee_type)}</td><td><b>${money(p.amount_paid)}</b></td><td>${dateText(p.payment_date)}</td><td>${esc(p.payment_method)}</td></tr>`).join("")||emptyRow(6);
}
function populateSelects(){
  $("report-student").innerHTML='<option value="">Choose a student…</option>'+students.map(s=>`<option value="${s.student_id}">${esc(s.name)} · ${esc(s.class_name)}</option>`).join("");
}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function go(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  $(`${view}-view`).classList.remove("hidden");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("page-title").textContent={dashboard:"Dashboard",students:"Students",fees:"Fee Details",payments:"Payments",reports:"Reports"}[view];
  if(view==="reports")populateSelects();
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("student-search").addEventListener("input",renderStudents);

function field(name,label,type="text",opts={}){return `<div class="field ${opts.full?"full":""}"><label for="f-${name}">${label}</label>${opts.options?`<select id="f-${name}" name="${name}" ${opts.required===false?"":"required"}>${opts.options}</select>`:`<input id="f-${name}" name="${name}" type="${type}" ${opts.required===false?"":"required"} ${opts.step?`step="${opts.step}"`:""} ${opts.min?`min="${opts.min}"`:""} ${opts.placeholder?`placeholder="${opts.placeholder}"`:""}>`}</div>`}
function openModal(mode,data={}){
  modalMode=mode;editingId=data.id||null;
  const titles={student:editingId?"Edit student":"Add student",fee:"Assign fee",payment:"Record payment"};
  $("modal-title").textContent=titles[mode];
  let html="";
  if(mode==="student") html=field("name","Student name","text",{full:true})+field("class_name","Class")+field("phone","Phone","tel",{required:false})+field("email","Email","email",{required:false,full:true});
  if(mode==="fee") html=field("student_id","Student","text",{full:true,options:'<option value="">Select student</option>'+students.map(s=>`<option value="${s.student_id}">${esc(s.name)} · ${esc(s.class_name)}</option>`).join("")})+field("academic_year","Academic year","text",{placeholder:"2026-2027"})+field("fee_type","Fee type","text",{placeholder:"Tuition Fee"})+field("total_amount","Total amount","number",{step:"0.01",min:"0.01"})+field("due_date","Due date","date");
  if(mode==="payment") html=field("fee_id","Student fee","text",{full:true,options:'<option value="">Select fee record</option>'+fees.filter(f=>Number(f.balance)>0).map(f=>`<option value="${f.fee_id}">${esc(f.student_name)} · ${esc(f.fee_type)} · Balance ${money(f.balance)}</option>`).join("")})+field("amount_paid","Amount paid","number",{step:"0.01",min:"0.01"})+field("payment_date","Payment date","date")+field("payment_method","Payment method","text",{placeholder:"UPI / Cash / Bank"})+field("receipt_no","Receipt number","text",{full:true,placeholder:"JSL-2026-0004"});
  $("modal-fields").innerHTML=html;
  if(mode==="student"&&data.student){Object.entries(data.student).forEach(([k,v])=>{const el=$(`f-${k}`);if(el)el.value=v||""})}
  if(mode==="payment"){$("f-payment_date").value=new Date().toISOString().slice(0,10);$("f-receipt_no").value=`JSL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}
  $("modal").showModal();
}
function closeModal(){$("modal").close()}
$("close-modal").onclick=closeModal;$("cancel-modal").onclick=closeModal;
$("add-student-btn").onclick=()=>openModal("student");
$("add-fee-btn").onclick=()=>openModal("fee");
$("add-payment-btn").onclick=()=>openModal("payment");
$("modal-form").addEventListener("submit",async e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  try{
    const routes={student:editingId?`/api/students/${editingId}`:"/api/students",fee:"/api/fees",payment:"/api/payments"};
    await api(routes[modalMode],{method:modalMode==="student"&&editingId?"PUT":"POST",body:JSON.stringify(data)});
    closeModal();toast("Saved successfully");await loadAll();
  }catch(err){showError(err)}
});
window.editStudent=id=>{const s=students.find(x=>x.student_id===id);openModal("student",{id,student:s})};
window.deleteStudent=async id=>{if(!confirm("Delete this student and all related fee/payment records?"))return;try{await api(`/api/students/${id}`,{method:"DELETE"});toast("Student deleted");await loadAll()}catch(e){showError(e)}};
window.deleteFee=async id=>{if(!confirm("Delete this fee and its payment records?"))return;try{await api(`/api/fees/${id}`,{method:"DELETE"});toast("Fee record deleted");await loadAll()}catch(e){showError(e)}};

$("generate-report").onclick=async()=>{
  const id=$("report-student").value;if(!id)return toast("Please select a student");
  try{
    const r=await api(`/api/reports/student/${id}`);
    const assigned=r.fees.reduce((a,f)=>a+Number(f.total_amount),0),paid=r.fees.reduce((a,f)=>a+Number(f.amount_paid),0);
    $("report-output").innerHTML=`<div class="report-head"><div><h3>Student Fee Statement</h3><span class="eyebrow">JHANSI SAI LAXMI</span></div><button class="secondary-btn" onclick="window.print()">Print report</button></div><div class="report-meta"><b>${esc(r.student.name)}</b><br>Student ID: ${r.student.student_id} &nbsp; | &nbsp; Class: ${esc(r.student.class_name)}<br>Phone: ${esc(r.student.phone||"—")} &nbsp; | &nbsp; Email: ${esc(r.student.email||"—")}</div><div class="table-wrap"><table><thead><tr><th>ACADEMIC YEAR</th><th>FEE TYPE</th><th>TOTAL</th><th>PAID</th><th>BALANCE</th><th>DUE DATE</th><th>STATUS</th></tr></thead><tbody>${r.fees.map(f=>`<tr><td>${esc(f.academic_year)}</td><td>${esc(f.fee_type)}</td><td>${money(f.total_amount)}</td><td>${money(f.amount_paid)}</td><td>${money(f.balance)}</td><td>${dateText(f.due_date)}</td><td>${status(f.balance,f.amount_paid)}</td></tr>`).join("")||emptyRow(7,"No fee records assigned.")}</tbody></table></div><div class="report-total"><div>Assigned fees<b>${money(assigned)}</b></div><div>Paid amount<b>${money(paid)}</b></div><div>Pending amount<b>${money(Math.max(assigned-paid,0))}</b></div></div>`;
  }catch(e){showError(e)}
};
loadAll();
