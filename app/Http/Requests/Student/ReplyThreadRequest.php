<?php
namespace App\Http\Requests\Student;
use Illuminate\Foundation\Http\FormRequest;
class ReplyThreadRequest extends FormRequest
{
    public function authorize(): bool{return $this->user() !== null;}
    public function rules(): array{return ['body'=>['required','string','max:2000']];}
}
