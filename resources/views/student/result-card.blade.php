<!doctype html>
<html>
<head><meta charset="utf-8"><title>Result Card</title><style>body{font-family:Arial;padding:40px}.card{max-width:700px;margin:auto;border:1px solid #ddd;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:start}@media print{body{padding:0}}</style></head>
<body><div class="card"><h1>{{ $exam->title }}</h1><p>{{ $student->name }} - {{ $student->roll_number }}</p><table><thead><tr><th>Subject</th><th>Marks</th><th>Total</th></tr></thead><tbody>@foreach($results as $result)<tr><td>{{ $result->subject?->name }}</td><td>{{ $result->marks_obtained }}</td><td>{{ $result->subject?->total_marks }}</td></tr>@endforeach</tbody></table></div></body>
</html>
