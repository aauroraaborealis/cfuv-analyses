import React, { useState } from 'react';

const AnthropometryForm: React.FC = () => {
    const [userId, setUserId] = useState<number>(1);
    const [height, setHeight] = useState<number | ''>('');
    const [weight, setWeight] = useState<number | ''>('');
    const [waistCircumference, setWaistCircumference] = useState<number | ''>('');
    const [hipCircumference, setHipCircumference] = useState<number | ''>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = {
            user_id: userId,
            height: height || null,
            weight: weight || null,
            waist_circumference: waistCircumference || null,
            hip_circumference: hipCircumference || null
        };

        try {
            const response = await fetch('http://localhost:8080/api/anthropometry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                const result = await response.json();
                alert('Данные успешно отправлены!');
                console.log(result);
            } else {
                alert('Ошибка отправки данных');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('Ошибка отправки данных');
        }
    };

    return (
        <div>
            <h3>Форма Антропометрии</h3>
            <form onSubmit={handleSubmit}>
                <div className='column'>
                    <label>Рост (см):</label>
                    <input 
                        type="number" 
                        value={height} 
                        onChange={(e) => setHeight(Number(e.target.value) || '')} 
                        required 
                    />
                </div>
                <div className='column'>
                    <label>Вес (кг):</label>
                    <input 
                        type="number" 
                        value={weight} 
                        onChange={(e) => setWeight(Number(e.target.value) || '')} 
                        required 
                    />
                </div>
                <div className='column'>
                    <label>Обхват талии (см):</label>
                    <input 
                        type="number" 
                        value={waistCircumference} 
                        onChange={(e) => setWaistCircumference(Number(e.target.value) || '')} 
                    />
                </div>
                <div className='column'>
                    <label>Обхват бедер (см):</label>
                    <input 
                        type="number" 
                        value={hipCircumference} 
                        onChange={(e) => setHipCircumference(Number(e.target.value) || '')} 
                    />
                </div>
                <button type="submit">Отправить</button>
            </form>
        </div>
    );
};

export default AnthropometryForm;
