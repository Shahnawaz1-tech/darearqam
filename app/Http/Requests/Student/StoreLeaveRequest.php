<?php
namespace App\Http\Requests\Student;
use Illuminate\Foundation\Http\FormRequest;
class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool{return $this->user() !== null;}
    public function rules(): array{return [
        'from'=>'required|date',
        'to'=>'required|date|after_or_equal:from',
        'reason'=>'required|string|max:2000',
    ];}
}
