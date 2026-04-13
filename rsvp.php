<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['name']) && isset($data['phone']) && isset($data['attendance'])) {
        $file = 'rsvp.json';
        
        $current_data = [];
        if (file_exists($file)) {
            $current_data = json_decode(file_get_contents($file), true);
            if (!is_array($current_data)) {
                $current_data = [];
            }
        }

        $data['timestamp'] = date('Y-m-d H:i:s');
        $current_data[] = $data;

        if (file_put_contents($file, json_encode($current_data, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => 'RSVP saved successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save RSVP']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
