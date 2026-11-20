<!doctype html>
<html>
<head><meta charset="utf-8"><title>Student ID Card</title><style>body{font-family:Arial;background:#eef2f7;padding:40px}.card{width:420px;margin:auto;border:1px solid #ddd;border-radius:16px;background:#fff;padding:24px}h1{color:#6b3fe0}.logo{width:72px;height:72px}.row{display:flex;justify-content:space-between;border-top:1px solid #eee;padding:8px 0}@media print{body{background:#fff}}</style></head>
<body><div class="card"><img class="logo" src="/madrasa-logo.png" alt=""><h1>Madrasa Dar-e-Arqam</h1><div class="row"><b>{{ $student->name }}</b><span>{{ $student->roll_number }}</span></div><div class="row"><span>Student</span><span>{{ $student->class?->name }}</span></div></div></body>
</html>
