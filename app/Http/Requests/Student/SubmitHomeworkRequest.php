<?php
namespace App\Http\Requests\Student;
use Illuminate\Foundation\Http\FormRequest;
class SubmitHomeworkRequest extends FormRequest
{
    public function authorize(): bool{return $this->user() !== null;}
    public function rules(): array{return [
        'text'=>['nullable','string','max:5000'],
        'file'=>['nullable','file','mimes:pdf,jpg,jpeg,png,docx','max:5120','required_without:text'],
    ];}
}
