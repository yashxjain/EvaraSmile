import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

function DealerList() {
    const [dealers, setDealers] = useState([]);
    const { user } = useAuth();  // Get empId from authenticated user

    useEffect(() => {
        const fetchDealers = async () => {
            try {
                const response = await axios.get(`https://namami-infotech.com/EvaraBackend/SalesSmile/src/dealer/get_dealers.php`, {
                    params: { empId: user.emp_id }  // Fetching dealers by empId
                });

                if (response.data.success) {
                    setDealers(response.data.data);

                } else {
                    console.error('Failed to fetch dealers');
                }
            } catch (err) {
                console.error('Error fetching dealers:', err);
            }
        };

        fetchDealers();
    }, [user.emp_id]);
    return (
        <div>
            <h2>Dealer List</h2>
            <ul>
                {dealers && dealers.map((dealer) => (
                    <li key={dealer.dealerId}>
                        {dealer.DealerName} - {dealer.Address} - {dealer.ContactInfo}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DealerList;
